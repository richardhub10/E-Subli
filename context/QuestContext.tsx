import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCHOLAR_QUESTS, ScholarQuest, QuestActionType } from '../data/questsData';
import { useProfile } from './ProfileContext';

type QuestContextType = {
  currentQuest: ScholarQuest;
  questProgress: number;
  isCompleted: boolean;
  isClaiming: boolean;
  claimQuestReward: () => Promise<{ success: boolean; xpEarned: number; nextQuest: ScholarQuest } | null>;
  recordQuestAction: (actionType: QuestActionType, amount?: number) => Promise<void>;
  resetQuests: () => Promise<void>;
};

const STORAGE_KEYS = {
  QUEST_INDEX: '@esubli_active_quest_index',
  QUEST_PROGRESS: '@esubli_active_quest_progress',
  CLAIMED_IDS: '@esubli_claimed_quest_ids',
};

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const QuestProvider = ({ children }: { children: ReactNode }) => {
  const { addXP, profile } = useProfile();
  
  const [questIndex, setQuestIndex] = useState(0);
  const [questProgress, setQuestProgress] = useState(0);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentQuest = SCHOLAR_QUESTS[questIndex % SCHOLAR_QUESTS.length];
  const isCompleted = questProgress >= currentQuest.target;

  // 1. Load Quest State on mount
  useEffect(() => {
    async function loadStoredQuestState() {
      try {
        const [savedIdx, savedProg, savedClaimed] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.QUEST_INDEX),
          AsyncStorage.getItem(STORAGE_KEYS.QUEST_PROGRESS),
          AsyncStorage.getItem(STORAGE_KEYS.CLAIMED_IDS),
        ]);

        if (savedIdx !== null) {
          setQuestIndex(parseInt(savedIdx, 10) || 0);
        }
        if (savedProg !== null) {
          setQuestProgress(parseInt(savedProg, 10) || 0);
        }
        if (savedClaimed !== null) {
          setClaimedIds(JSON.parse(savedClaimed) || []);
        }
      } catch (e) {
        console.error('Error loading quest state from storage:', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadStoredQuestState();
  }, []);

  // 2. Record action progress towards active quest
  const recordQuestAction = async (actionType: QuestActionType, amount: number = 1) => {
    if (!isLoaded) return;
    
    // Only increment if the action matches the current quest's objective
    if (currentQuest.actionType === actionType) {
      setQuestProgress(prev => {
        const updated = Math.min(currentQuest.target, prev + amount);
        AsyncStorage.setItem(STORAGE_KEYS.QUEST_PROGRESS, updated.toString()).catch(console.error);
        return updated;
      });
    }
  };

  // 3. Claim Quest Reward (Strictly One-Time per quest cycle)
  const claimQuestReward = async () => {
    if (!isCompleted || isClaiming) return null;

    setIsClaiming(true);
    try {
      const rewardXp = currentQuest.rewardXp;
      
      // Award XP to profile
      await addXP(rewardXp);

      // Record this quest as claimed
      const updatedClaimed = [...claimedIds, currentQuest.id];
      setClaimedIds(updatedClaimed);

      // Advance to next unique quest
      const nextIndex = (questIndex + 1) % SCHOLAR_QUESTS.length;
      const nextQuest = SCHOLAR_QUESTS[nextIndex];

      // Reset progress for new quest
      setQuestIndex(nextIndex);
      setQuestProgress(0);

      // Persist new state
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.QUEST_INDEX, nextIndex.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.QUEST_PROGRESS, '0'),
        AsyncStorage.setItem(STORAGE_KEYS.CLAIMED_IDS, JSON.stringify(updatedClaimed)),
      ]);

      return {
        success: true,
        xpEarned: rewardXp,
        nextQuest,
      };
    } catch (e) {
      console.error('Error claiming quest reward:', e);
      return null;
    } finally {
      setIsClaiming(false);
    }
  };

  const resetQuests = async () => {
    setQuestIndex(0);
    setQuestProgress(0);
    setClaimedIds([]);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.QUEST_INDEX),
      AsyncStorage.removeItem(STORAGE_KEYS.QUEST_PROGRESS),
      AsyncStorage.removeItem(STORAGE_KEYS.CLAIMED_IDS),
    ]);
  };

  return (
    <QuestContext.Provider
      value={{
        currentQuest,
        questProgress,
        isCompleted,
        isClaiming,
        claimQuestReward,
        recordQuestAction,
        resetQuests,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};

export const useQuest = () => {
  const context = useContext(QuestContext);
  if (!context) {
    return {
      currentQuest: SCHOLAR_QUESTS[0],
      questProgress: 0,
      isCompleted: false,
      isClaiming: false,
      claimQuestReward: async () => null,
      recordQuestAction: async () => {},
      resetQuests: async () => {},
    };
  }
  return context;
};
