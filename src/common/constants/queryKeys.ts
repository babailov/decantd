export const queryKeys = {
  tastingPlans: {
    all: ['tasting-plans'] as const,
    byId: (id: string) => ['tasting-plans', id] as const,
  },
};
