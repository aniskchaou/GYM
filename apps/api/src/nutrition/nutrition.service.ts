import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}

  // ─── Food items ───
  searchFoods(q?: string) {
    return this.prisma.foodItem.findMany({
      where: q
        ? { name: { contains: q, mode: 'insensitive' }, isPublic: true }
        : { isPublic: true },
      take: 50,
      orderBy: { name: 'asc' },
    });
  }

  createFood(dto: any) {
    return this.prisma.foodItem.create({
      data: {
        name: dto.name,
        category: dto.category ?? null,
        calories: Number(dto.calories),
        protein: Number(dto.protein),
        carbs: Number(dto.carbs),
        fat: Number(dto.fat),
        servingG: dto.servingG != null ? Number(dto.servingG) : null,
        isPublic: dto.isPublic ?? true,
      },
    });
  }

  // ─── Meal plans ───
  listForMember(memberId: string) {
    return this.prisma.mealPlan.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      include: {
        days: { include: { meals: true }, orderBy: { dayNumber: 'asc' } },
      },
    });
  }

  listAuthored(authorId: string) {
    return this.prisma.mealPlan.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async get(id: string) {
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id },
      include: {
        days: { orderBy: { dayNumber: 'asc' }, include: { meals: true } },
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!plan) throw new NotFoundException('Meal plan not found');
    return { ...plan, dailyTotals: this.dailyTotals(plan as any) };
  }

  create(authorId: string, gymId: string | undefined, dto: any) {
    return this.prisma.mealPlan.create({
      data: {
        memberId: dto.memberId,
        authorId,
        gymId: gymId ?? null,
        title: dto.title,
        goal: dto.goal ?? null,
        calories: dto.calories != null ? Number(dto.calories) : null,
        proteinG: dto.proteinG != null ? Number(dto.proteinG) : null,
        carbsG: dto.carbsG != null ? Number(dto.carbsG) : null,
        fatG: dto.fatG != null ? Number(dto.fatG) : null,
        notes: dto.notes ?? null,
      },
    });
  }

  async update(id: string, dto: any) {
    const p = await this.prisma.mealPlan.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Meal plan not found');
    return this.prisma.mealPlan.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.goal !== undefined && { goal: dto.goal }),
        ...(dto.calories !== undefined && { calories: dto.calories != null ? Number(dto.calories) : null }),
        ...(dto.proteinG !== undefined && { proteinG: dto.proteinG != null ? Number(dto.proteinG) : null }),
        ...(dto.carbsG !== undefined && { carbsG: dto.carbsG != null ? Number(dto.carbsG) : null }),
        ...(dto.fatG !== undefined && { fatG: dto.fatG != null ? Number(dto.fatG) : null }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    await this.prisma.mealPlanMeal.deleteMany({ where: { day: { planId: id } } });
    await this.prisma.mealPlanDay.deleteMany({ where: { planId: id } });
    await this.prisma.mealPlan.delete({ where: { id } });
    return { success: true };
  }

  async upsertDay(planId: string, dto: { dayNumber: number }) {
    const existing = await this.prisma.mealPlanDay.findFirst({
      where: { planId, dayNumber: Number(dto.dayNumber) },
    });
    if (existing) return existing;
    return this.prisma.mealPlanDay.create({
      data: { planId, dayNumber: Number(dto.dayNumber) },
    });
  }

  addMeal(dayId: string, dto: any) {
    return this.prisma.mealPlanMeal.create({
      data: {
        dayId,
        type: dto.type,
        name: dto.name,
        calories: dto.calories != null ? Number(dto.calories) : null,
        protein: dto.protein != null ? Number(dto.protein) : null,
        carbs: dto.carbs != null ? Number(dto.carbs) : null,
        fat: dto.fat != null ? Number(dto.fat) : null,
        recipe: dto.recipe ?? null,
      },
    });
  }

  async removeMeal(mealId: string) {
    await this.prisma.mealPlanMeal.delete({ where: { id: mealId } });
    return { success: true };
  }

  private dailyTotals(plan: { days: Array<{ dayNumber: number; meals: any[] }> }) {
    return plan.days.map((d) => ({
      dayNumber: d.dayNumber,
      calories: d.meals.reduce((s, m) => s + (m.calories ?? 0), 0),
      protein: d.meals.reduce((s, m) => s + (m.protein ?? 0), 0),
      carbs: d.meals.reduce((s, m) => s + (m.carbs ?? 0), 0),
      fat: d.meals.reduce((s, m) => s + (m.fat ?? 0), 0),
    }));
  }
}
