"use client";

import { useCallback, useEffect, useState } from "react";
import { projectsApi } from "@/lib/supabase/projects";
import { Project } from "@/lib/supabase/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create project
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newProject = await projectsApi.create(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProject = await projectsApi.update(id, updates);
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update sale address
  const updateSaleAddress = useCallback(async (id: string, saleAddress: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProject = await projectsApi.updateSaleAddress(id, saleAddress);
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update sale address");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await projectsApi.delete(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    updateSaleAddress,
    deleteProject,
  };
}
