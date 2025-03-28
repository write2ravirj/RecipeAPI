import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecipes()
  }, [])

  async function fetchRecipes() {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center p-4">Loading recipes...</div>
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Recipes</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{recipe.title}</h3>
                <dl className="mt-2 divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Cooking Time</dt>
                    <dd className="text-sm text-gray-900">{recipe.making_time}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Serves</dt>
                    <dd className="text-sm text-gray-900">{recipe.serves}</dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500">Ingredients</dt>
                    <dd className="mt-1 text-sm text-gray-900">{recipe.ingredients}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Cost</dt>
                    <dd className="text-sm text-gray-900">¥{recipe.cost}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App