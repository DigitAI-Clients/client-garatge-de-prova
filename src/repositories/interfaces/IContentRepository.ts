import { LandingSectionData } from '@/types/models';

export interface IContentRepository {
  getLandingSections(locale: string): Promise<LandingSectionData[]>;
}