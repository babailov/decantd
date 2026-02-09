export const queryKeys = {
  tastingPlans: {
    all: ['tasting-plans'] as const,
    byId: (id: string) => ['tasting-plans', id] as const,
  },
  user: {
    plans: ['user', 'plans'] as const,
    ratings: ['user', 'ratings'] as const,
    ratingsForPlan: (planId: string) => ['user', 'ratings', planId] as const,
  },
  corkage: {
    all: ['corkage'] as const,
    byCity: (city: string) => ['corkage', city] as const,
  },
  generation: {
    status: ['generation', 'status'] as const,
  },
};
