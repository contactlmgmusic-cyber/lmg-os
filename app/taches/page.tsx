"use client"

import { useEffect, useState } from "react"

type Tache = {
  id: string
  titre: string | null
  description: string | null
  statut: string | null
  priorite: string | null
  assigned_to: string | null
  created_at: string
}

export default function TachesPage() {
  const [taches, setTaches] = useState<Tache[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [titre, setTitre] = useState("")
  const [description, setDescription] = useState("")
  const [priorite, setPriorite] = useState("moyenne")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setErrorMessage("")

      const response = await fetch("/api/taches", {
        cache: "no-store",
      })

      const data = await response.json()

      console.log("API DATA :", data)

      if (!response.ok) {
        setErrorMessage(data.error || "Erreur chargement des tâches.")
        setTaches([])
        return
      }

      setTaches(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setErrorMessage("Erreur inconnue pendant le chargement.")
      setTaches([])
    } finally {
      setLoading(false)
    }
  }

  const createTache = async () => {
    if (!titre.trim()) {
      alert("Ajoute un titre à ta tâche.")
      return
    }

    try {
      setSaving(true)
      setErrorMessage("")

      const response = await fetch("/api/taches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre: titre.trim(),
          description: description.trim() || null,
          priorite,
          statut: "a_faire",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || "Erreur création tâche.")
        alert(data.error || "Erreur création tâche.")
        return
      }

      setTitre("")
      setDescription("")
      setPriorite("moyenne")

      await loadData()
    } catch (error) {
      console.error(error)
      setErrorMessage("Erreur inconnue pendant la création.")
    } finally {
      setSaving(false)
    }
  }

  const updateStatut = async (id: string, statut: string) => {
    try {
      setErrorMessage("")

      const response = await fetch(`/api/taches/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statut }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || "Erreur changement statut.")
        alert(data.error || "Erreur changement statut.")
        return
      }

      await loadData()
    } catch (error) {
      console.error(error)
      setErrorMessage("Erreur inconnue pendant la mise à jour.")
    }
  }

  const colonnes = [
    { key: "a_faire", label: "À faire" },
    { key: "en_cours", label: "En cours" },
    { key: "terminee", label: "Terminées" },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Chargement des tâches...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tâches LMG</h1>
        <p className="text-sm text-gray-500">
          Création, suivi et assignation des tâches.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold">Créer une tâche</h2>

        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre de la tâche"
          className="w-full rounded-xl border px-4 py-2 text-sm"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full rounded-xl border px-4 py-2 text-sm"
        />

        <select
          value={priorite}
          onChange={(e) => setPriorite(e.target.value)}
          className="w-full rounded-xl border px-4 py-2 text-sm"
        >
          <option value="basse">Priorité basse</option>
          <option value="moyenne">Priorité moyenne</option>
          <option value="haute">Priorité haute</option>
        </select>

        <button
          onClick={createTache}
          disabled={saving}
          className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Création..." : "Ajouter la tâche"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {colonnes.map((colonne) => {
          const tachesColonne = taches.filter((tache) => {
            const statut = tache.statut || "a_faire"
            return statut === colonne.key
          })

          return (
            <div
              key={colonne.key}
              className="rounded-2xl border bg-gray-50 p-4"
            >
              <h3 className="mb-4 font-semibold">{colonne.label}</h3>

              <div className="space-y-3">
                {tachesColonne.length === 0 && (
                  <p className="text-xs text-gray-400">Aucune tâche</p>
                )}

                {tachesColonne.map((tache) => (
                  <div
                    key={tache.id}
                    className="rounded-xl bg-white p-4 shadow-sm border space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-medium">
                        {tache.titre || "Sans titre"}
                      </h4>

                      <span className="text-xs rounded-full bg-gray-100 px-2 py-1">
                        {tache.priorite || "moyenne"}
                      </span>
                    </div>

                    <p className="text-xs text-red-500">
                      Statut base : {tache.statut || "vide"}
                    </p>

                    {tache.description && (
                      <p className="text-sm text-gray-600">
                        {tache.description}
                      </p>
                    )}

                    <select
                      value={tache.statut || "a_faire"}
                      onChange={(e) => updateStatut(tache.id, e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-xs"
                    >
                      <option value="a_faire">À faire</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminee">Terminée</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h3 className="font-semibold mb-3">Debug tâches</h3>

        <pre className="text-xs bg-gray-100 p-3 rounded-xl overflow-auto">
          {JSON.stringify(taches, null, 2)}
        </pre>
      </div>
    </div>
  )
}