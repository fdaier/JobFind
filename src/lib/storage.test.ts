import { beforeEach, describe, expect, it } from 'vitest';

import { createMockJobs, createMockMaterials } from './mock-data';
import { loadCompletedTaskIds, loadJobs, loadMaterials, saveCompletedTaskIds, saveJobs, saveMaterials } from './storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips jobs, materials, and completed task ids', () => {
    const jobs = createMockJobs();
    const materials = createMockMaterials();

    saveJobs(jobs);
    saveMaterials(materials);
    saveCompletedTaskIds(['task-1', 'task-2']);

    expect(loadJobs()).toEqual(jobs);
    expect(loadMaterials()).toEqual(materials);
    expect(loadCompletedTaskIds()).toEqual(['task-1', 'task-2']);
  });

  it('removes invalid JSON when loading', () => {
    localStorage.setItem('jobfind.jobs', '{bad json');

    expect(loadJobs()).toBeNull();
    expect(localStorage.getItem('jobfind.jobs')).toBeNull();
  });

  it('rejects structurally invalid job arrays and removes the stored value', () => {
    localStorage.setItem('jobfind.jobs', JSON.stringify([{}]));

    expect(loadJobs()).toBeNull();
    expect(localStorage.getItem('jobfind.jobs')).toBeNull();
  });

  it('rejects structurally invalid material arrays and removes the stored value', () => {
    localStorage.setItem('jobfind.materials', JSON.stringify([{ id: 'bad-material' }]));

    expect(loadMaterials()).toBeNull();
    expect(localStorage.getItem('jobfind.materials')).toBeNull();
  });
});
