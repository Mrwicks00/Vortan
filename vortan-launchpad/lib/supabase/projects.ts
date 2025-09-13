import { supabase } from "./client";
import { Project, CreateProjectData } from "./types";

export const projectsApi = {
  // Get all projects
  async getAll() {
    const { data, error } = await supabase
      .from("vortan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  // Get single project
  async getById(id: string) {
    const { data, error } = await supabase
      .from("vortan")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Get project by sale address
  async getBySaleAddress(saleAddress: string | null) {
    if (!saleAddress) {
      throw new Error("Sale address is required");
    }

    const { data, error } = await supabase
      .from("vortan")
      .select("*")
      .eq("sale_address", saleAddress)
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Create project
  async create(projectData: CreateProjectData) {
    const { data, error } = await supabase
      .from("vortan")
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Update project
  async update(id: string, updates: Partial<CreateProjectData>) {
    const { data, error } = await supabase
      .from("vortan")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Update sale address after contract deployment
  async updateSaleAddress(id: string, saleAddress: string) {
    const { data, error } = await supabase
      .from("vortan")
      .update({
        sale_address: saleAddress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Delete project
  async delete(id: string) {
    const { error } = await supabase.from("vortan").delete().eq("id", id);

    if (error) throw error;
  },
};
