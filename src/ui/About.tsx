export default function About(){
  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-xl font-black text-candy-700 mb-2">À propos</h1>
      <p className="text-sm opacity-70 mb-4">
        Cette application utilise l’API de TMDb mais n’est ni approuvée ni certifiée par TMDb.
      </p>
      <pre className="whitespace-pre-line leading-relaxed text-sm">
{`Mon amour,
un petit outil pour nous deux :
ranger nos envies, tirer au sort nos films,
laisser des étoiles aux soirées qui brillent,
et poser nos pas sur la carte—toi là, moi ici.

Si une idée germe, on la cueille :
l’app grandira avec nous.`}
      </pre>
    </div>
  )
}
