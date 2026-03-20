// Defining the types for travel entries and navigation parameters
export interface TravelEntry {
  id: string;
  imageUri: string;
  address: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
};
