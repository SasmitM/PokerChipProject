export interface Table {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
  current_pot: number;
}

export interface CreateTableInput {
  name: string;
  createdBy?: string;
}
