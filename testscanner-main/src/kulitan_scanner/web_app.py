from __future__ import annotations

import argparse
import base64
import io
import os
from pathlib import Path
from typing import Dict, List

import requests
import torch
from flask import Flask, jsonify, render_template, request
from PIL import Image
from torchvision import transforms

from .modeling import build_model
from .preprocess import extract_symbol_region


def _make_transform(image_size: int, mean: List[float], std: List[float]):
    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ]
    )


class KulitanPredictor:
    def __init__(
        self,
        checkpoint_path: Path,
        min_confidence: float,
        top_k: int,
        unknown_label: str,
        allow_no_symbol: bool,
    ) -> None:
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        checkpoint_path = _ensure_checkpoint(checkpoint_path)

        self.ckpt = torch.load(checkpoint_path, map_location=self.device)
        self.idx_to_label = {int(k): v for k, v in self.ckpt["idx_to_label"].items()}
        self.model = build_model(num_classes=len(self.idx_to_label))
        self.model.load_state_dict(self.ckpt["model_state"])
        self.model.to(self.device)
        self.model.eval()

        image_size = int(self.ckpt.get("image_size", 224))
        norm = self.ckpt.get("normalization", {})
        mean = norm.get("mean", [0.485, 0.456, 0.406])
        std = norm.get("std", [0.229, 0.224, 0.225])
        preprocessing = self.ckpt.get("preprocessing", {})

        self.tfm = _make_transform(image_size, mean, std)
        self.isolate_symbol = bool(preprocessing.get("isolate_symbol", True))
        self.min_symbol_area_ratio = float(preprocessing.get("min_symbol_area_ratio", 0.002))
        self.min_confidence = min_confidence
        self.top_k = top_k
        self.unknown_label = unknown_label
        self.allow_no_symbol = allow_no_symbol

    def _enhance_and_extract_glyph(self, pil_img: Image.Image):
        import cv2
        import numpy as np
        import base64
        import io

        cv_img = cv2.cvtColor(np.array(pil_img.convert("RGB")), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)

        # Background illumination normalization to remove paper shadows/yellow tint
        dilated = cv2.dilate(gray, np.ones((7, 7), np.uint8))
        bg = cv2.medianBlur(dilated, 21)
        diff = 255 - cv2.absdiff(gray, bg)
        norm = cv2.normalize(diff, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1)

        # Otsu thresholding for crisp dark ink extraction
        _, thresh = cv2.threshold(norm, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) < 15:
            return pil_img, None

        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        margin = 6
        h, w = thresh.shape
        y_min = max(0, y_min - margin)
        x_min = max(0, x_min - margin)
        y_max = min(h - 1, y_max + margin)
        x_max = min(w - 1, x_max + margin)

        glyph = thresh[y_min:y_max + 1, x_min:x_max + 1]
        gh, gw = glyph.shape
        target_size = 224
        glyph_target = int(target_size * 0.75)
        scale = glyph_target / max(gh, gw, 1)
        nw, nh = max(1, int(gw * scale)), max(1, int(gh * scale))
        resized = cv2.resize(glyph, (nw, nh), interpolation=cv2.INTER_AREA)

        # Place onto white 224x224 canvas
        canvas = np.zeros((target_size, target_size), dtype=np.uint8)
        sy = (target_size - nh) // 2
        sx = (target_size - nw) // 2
        canvas[sy:sy + nh, sx:sx + nw] = resized
        clean_gray = 255 - canvas
        clean_rgb = cv2.cvtColor(clean_gray, cv2.COLOR_GRAY2RGB)
        clean_pil = Image.fromarray(clean_rgb)

        # Base64 preview
        buffer = io.BytesIO()
        clean_pil.save(buffer, format="PNG")
        b64 = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")

        return clean_pil, b64

    def predict_pil(self, image: Image.Image) -> Dict[str, object]:
        image = image.convert("RGB")
        clean_image, preview_url = self._enhance_and_extract_glyph(image)

        tensor = self.tfm(clean_image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)
            top_probs, top_indices = torch.topk(probs, k=min(self.top_k, len(self.idx_to_label)), dim=1)

        results = []
        for prob, idx in zip(top_probs[0].tolist(), top_indices[0].tolist()):
            raw_lbl = self.idx_to_label[idx]
            display_lbl = raw_lbl.replace("_", "/").lower()
            results.append({"label": display_lbl, "confidence": float(prob)})

        out = {
            "prediction": results[0]["label"].lower(),
            "confidence": results[0]["confidence"],
            "top_k": results,
            "extracted_image_url": preview_url,
            "symbol_info": {"symbol_found": True, "confidence": results[0]["confidence"]},
        }
        return out


def _decode_data_url_to_image(data_url: str) -> Image.Image:
    if "," not in data_url:
        raise ValueError("Invalid image data URL")
    _, encoded = data_url.split(",", 1)
    raw = base64.b64decode(encoded)
    return Image.open(io.BytesIO(raw)).convert("RGB")


def _ensure_checkpoint(checkpoint_path: Path) -> Path:
    if checkpoint_path.exists():
        return checkpoint_path

    model_url = os.getenv("MODEL_URL", "").strip()
    if not model_url:
        raise FileNotFoundError(
            f"Checkpoint not found: {checkpoint_path}. Set MODEL_URL to auto-download it at startup."
        )

    checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
    response = requests.get(model_url, timeout=120)
    response.raise_for_status()
    checkpoint_path.write_bytes(response.content)
    return checkpoint_path


def create_app(
    checkpoint: Path,
    min_confidence: float,
    top_k: int,
    unknown_label: str,
    allow_no_symbol: bool,
) -> Flask:
    app = Flask(
        __name__,
        template_folder=str(Path(__file__).parent / "templates"),
        static_folder=str(Path(__file__).parent / "static"),
    )
    predictor = None
    predictor_error = ""
    try:
        predictor = KulitanPredictor(
            checkpoint_path=checkpoint,
            min_confidence=min_confidence,
            top_k=top_k,
            unknown_label=unknown_label,
            allow_no_symbol=allow_no_symbol,
        )
    except Exception as exc:
        predictor_error = str(exc)

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.post("/api/scan")
    def scan_api():
        try:
            if predictor is None:
                return (
                    jsonify(
                        {
                            "error": "Model is not ready. Train first or set MODEL_URL.",
                            "details": predictor_error,
                        }
                    ),
                    503,
                )

            if "file" in request.files and request.files["file"].filename:
                file = request.files["file"]
                image = Image.open(file.stream).convert("RGB")
            else:
                payload = request.get_json(silent=True) or {}
                data_url = payload.get("image_data_url")
                if not data_url:
                    return jsonify({"error": "No image provided"}), 400
                image = _decode_data_url_to_image(data_url)

            output = predictor.predict_pil(image)
            return jsonify(output)
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    return app


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Kulitan web scanner")
    parser.add_argument("--checkpoint", type=Path, default=Path("artifacts/best_model.pt"))
    parser.add_argument("--host", type=str, default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5000)
    parser.add_argument("--min-confidence", type=float, default=0.70)
    parser.add_argument("--top-k", type=int, default=3)
    parser.add_argument("--unknown-label", type=str, default="unknown")
    parser.add_argument("--allow-no-symbol", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    app = create_app(
        checkpoint=args.checkpoint,
        min_confidence=args.min_confidence,
        top_k=args.top_k,
        unknown_label=args.unknown_label,
        allow_no_symbol=args.allow_no_symbol,
    )
    app.run(host=args.host, port=args.port, debug=False)


if __name__ == "__main__":
    main()
