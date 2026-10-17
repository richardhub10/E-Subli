from __future__ import annotations

import os
import sys
from pathlib import Path

# Ensure root directory of testscanner is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.kulitan_scanner.web_app import create_app

ckpt_env = os.getenv("CHECKPOINT_PATH", "artifacts/best_model.pt")
checkpoint = Path(ckpt_env)
if not checkpoint.is_absolute():
    checkpoint = BASE_DIR / checkpoint

min_confidence = float(os.getenv("MIN_CONFIDENCE", "0.70"))
top_k = int(os.getenv("TOP_K", "3"))
unknown_label = os.getenv("UNKNOWN_LABEL", "unknown")
allow_no_symbol = os.getenv("ALLOW_NO_SYMBOL", "false").lower() in {"1", "true", "yes", "on"}

app = create_app(
    checkpoint=checkpoint,
    min_confidence=min_confidence,
    top_k=top_k,
    unknown_label=unknown_label,
    allow_no_symbol=allow_no_symbol,
)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
