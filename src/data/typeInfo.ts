export interface TypeInfo {
  id: string;
  name: string;
  nameEn: string;
  catchcopy: string;
  color: string;
  description: string;
  motivators: string[];
  demotivators: string[];
  goodSigns: string[];
  badSigns: string[];
  helpfulActions: string;
  teamValue: string;
  overdone: string;
  innerVoice?: string;
}

// Placeholder skeleton — text content to be provided.
export const typeInfo: Record<string, TypeInfo> = {
  competitor: {
    id: 'competitor',
    name: 'コンペティター',
    nameEn: 'Competitor',
    catchcopy: '',
    color: '#FF4444',
    description: '',
    motivators: [],
    demotivators: [],
    goodSigns: [],
    badSigns: [],
    helpfulActions: '',
    teamValue: '',
    overdone: '',
  },
  achiever: {
    id: 'achiever',
    name: 'アチーバー',
    nameEn: 'Achiever',
    catchcopy: '',
    color: '#FFD700',
    description: '',
    motivators: [],
    demotivators: [],
    goodSigns: [],
    badSigns: [],
    helpfulActions: '',
    teamValue: '',
    overdone: '',
  },
  socializer: {
    id: 'socializer',
    name: 'ソーシャライザー',
    nameEn: 'Socializer',
    catchcopy: '',
    color: '#00E676',
    description: '',
    motivators: [],
    demotivators: [],
    goodSigns: [],
    badSigns: [],
    helpfulActions: '',
    teamValue: '',
    overdone: '',
  },
  explorer: {
    id: 'explorer',
    name: 'エクスプローラー',
    nameEn: 'Explorer',
    catchcopy: '',
    color: '#448AFF',
    description: '',
    motivators: [],
    demotivators: [],
    goodSigns: [],
    badSigns: [],
    helpfulActions: '',
    teamValue: '',
    overdone: '',
  },
  attacker: {
    id: 'attacker',
    name: 'アタッカー',
    nameEn: 'Attacker',
    catchcopy: '',
    color: '#FF6D00',
    description: '',
    motivators: [],
    demotivators: [],
    goodSigns: [],
    badSigns: [],
    helpfulActions: '',
    teamValue: '',
    overdone: '',
    innerVoice: '',
  },
  guardian: {
    id: 'guardian',
    name: 'ガーディアン',
    nameEn: 'Guardian',
    catchcopy: '',
    color: '#00BCD4',
    description: '',
    motivators: [],
    demotivators: [],
    goodSigns: [],
    badSigns: [],
    helpfulActions: '',
    teamValue: '',
    overdone: '',
    innerVoice: '',
  },
  analyst: {
    id: 'analyst',
    name: 'アナリスト',
    nameEn: 'Analyst',
    catchcopy: '',
    color: '#AA00FF',
    description: '',
    motivators: [],
    demotivators: [],
    goodSigns: [],
    badSigns: [],
    helpfulActions: '',
    teamValue: '',
    overdone: '',
    innerVoice: '',
  },
  booster: {
    id: 'booster',
    name: 'ブースター',
    nameEn: 'Booster',
    catchcopy: '',
    color: '#FF4081',
    description: '',
    motivators: [],
    demotivators: [],
    goodSigns: [],
    badSigns: [],
    helpfulActions: '',
    teamValue: '',
    overdone: '',
    innerVoice: '',
  },
};
