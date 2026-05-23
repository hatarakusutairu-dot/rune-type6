export interface ComboAnalysis {
  work1Type: string;
  work2Type: string;
  catchcopy: string;
  description: string;
  motivators: string[];
  demotivators: string[];
  goodSigns: string[];
  badSigns: string[];
  helpfulActions: string;
  teamRole: string;
}

// Placeholder skeleton — text content to be provided.
// Keyed by `${work1Type}:${work2Type}` for direct lookup.
export const comboAnalysis: Record<string, ComboAnalysis> = {};

export const balancedAnalysis: ComboAnalysis = {
  work1Type: 'balanced',
  work2Type: 'balanced',
  catchcopy: '',
  description: '',
  motivators: [],
  demotivators: [],
  goodSigns: [],
  badSigns: [],
  helpfulActions: '',
  teamRole: '',
};
