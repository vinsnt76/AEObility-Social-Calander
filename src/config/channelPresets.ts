export type ChannelKey = 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'googleBusiness';

export type AspectRatio = '4:5' | '16:9' | '1:1' | '1.91:1' | '4:3';

export interface ChannelPresetConfig {
  defaultRatio: AspectRatio;
  allowedRatios: AspectRatio[];
  characterLimit: number;
  label: string;
}

export const CHANNEL_CONFIGS: Record<ChannelKey, ChannelPresetConfig> = {
  instagram: {
    defaultRatio: '4:5',
    allowedRatios: ['4:5', '1:1'],
    characterLimit: 2200,
    label: 'Instagram',
  },
  youtube: {
    defaultRatio: '16:9',
    allowedRatios: ['16:9'],
    characterLimit: 5000,
    label: 'YouTube Community / Video',
  },
  linkedin: {
    defaultRatio: '1:1',
    allowedRatios: ['1:1', '4:5'],
    characterLimit: 3000,
    label: 'LinkedIn',
  },
  facebook: {
    defaultRatio: '1.91:1',
    allowedRatios: ['1.91:1', '1:1'],
    characterLimit: 63206,
    label: 'Facebook',
  },
  googleBusiness: {
    defaultRatio: '4:3',
    allowedRatios: ['4:3', '1:1'],
    characterLimit: 1500,
    label: 'Google Business Profile',
  },
};
