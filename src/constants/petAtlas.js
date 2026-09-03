export const PET_ATLAS = {
  columns: 8,
  rows: 9,
  cellWidth: 192,
  cellHeight: 208,
  width: 1536,
  height: 1872
};

export function getPetAtlas(version = 1) {
  if (version !== 1 && version !== 2) throw new Error(`不支持的素材版本：${version}`);
  return version === 2 ? { ...PET_ATLAS, rows: 11, height: 2288 } : PET_ATLAS;
}

export function getAnimationStates(version = 1) {
  return version === 2
    ? [...PET_ANIMATION_STATES, { id: "look", label: "环视", row: 9, columns: Array.from({ length: 16 }, (_, i) => i), durations: [] }]
    : PET_ANIMATION_STATES;
}

export function getFramePosition(state, frameIndex = 0) {
  const column = state.columns[frameIndex % state.columns.length] ?? 0;
  return state.id === "look"
    ? { column: column % 8, row: 9 + Math.floor(column / 8) }
    : { column, row: state.row };
}

export const PET_ANIMATION_STATES = [
  { id: "idle", label: "待机", row: 0, columns: [0, 1, 2, 3, 4, 5], durations: [280, 110, 110, 140, 140, 320] },
  { id: "running-right", label: "向右跑", row: 1, columns: [0, 1, 2, 3, 4, 5, 6, 7], durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  { id: "running-left", label: "向左跑", row: 2, columns: [0, 1, 2, 3, 4, 5, 6, 7], durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  { id: "waving", label: "挥手", row: 3, columns: [0, 1, 2, 3], durations: [140, 140, 140, 280] },
  { id: "jumping", label: "跳跃", row: 4, columns: [0, 1, 2, 3, 4], durations: [140, 140, 140, 140, 280] },
  { id: "failed", label: "失败", row: 5, columns: [0, 1, 2, 3, 4, 5, 6, 7], durations: [140, 140, 140, 140, 140, 140, 140, 240] },
  { id: "waiting", label: "等待", row: 6, columns: [0, 1, 2, 3, 4, 5], durations: [150, 150, 150, 150, 150, 260] },
  { id: "running", label: "运行中", row: 7, columns: [0, 1, 2, 3, 4, 5], durations: [120, 120, 120, 120, 120, 220] },
  { id: "review", label: "检查", row: 8, columns: [0, 1, 2, 3, 4, 5], durations: [150, 150, 150, 150, 150, 280] }
];
