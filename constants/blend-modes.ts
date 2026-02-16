export type BlendMode = 'style_transfer' | 'mashup' | 'debate' | 'poetry';

export const BLEND_MODE_LABELS: Record<BlendMode, string> = {
  style_transfer: 'Style Transfer',
  mashup: 'Mashup',
  debate: 'Debate',
  poetry: 'Poetry',
};

export const BLEND_MODE_DESCRIPTIONS: Record<BlendMode, string> = {
  style_transfer: 'Rewrite Text 1 in the style of Text 2',
  mashup: 'Creatively combine these two texts into one',
  debate: 'Turn these into a dialogue between two perspectives',
  poetry: 'Blend both texts into a short poem',
};
