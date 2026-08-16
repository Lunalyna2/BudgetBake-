import RecipeCalculator from '@/app/components/RecipeCalculator';

export default function TestPage() {
  return (
    <div className="p-8">
      <RecipeCalculator recipeId="test-id" />
    </div>
  );
}