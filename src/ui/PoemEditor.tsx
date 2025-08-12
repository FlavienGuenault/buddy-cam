import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPoem, updatePoem, publishPoem, deletePoem, getPoemById } from '../lib/db'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

export default function PoemEditor(){
  const nav = useNavigate()
  const { id: editId } = useParams<{id:string}>()
  const isEditing = !!editId

  const [poemId, setPoemId] = useState<string|undefined>(undefined)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // UI
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)
  const [toast, setToast] = useState<string>('')

  useEffect(() => {
    if (!isEditing || !editId) return
    ;(async ()=>{
      const p = await getPoemById(editId)
      setPoemId(p.id); setTitle(p.title); setContent(p.content)
    })()
  }, [isEditing, editId])

  function showToast(msg:string){
    setToast(msg)
    setTimeout(()=>setToast(''), 1500)
  }

  async function saveDraft(){
    if (!title.trim()) { showToast('Titre requis'); return }
    if (!poemId){
      const p = await createPoem(title.trim())
      setPoemId(p.id)
    }
    await updatePoem(poemId!, { title: title.trim(), content })
    showToast('Brouillon enregistré')
  }

  async function onPublish(){
    if (!title.trim()) { showToast('Titre requis'); return }
    let id = poemId
    if (!id){
      const p = await createPoem(title.trim())
      id = p.id; setPoemId(id)
    }
    await updatePoem(id!, { title: title.trim(), content })
    await publishPoem(id!)
    nav(`/poems/${id}`)
  }

  function surround(markLeft: string, markRight=markLeft){
    const ta = taRef.current; if (!ta) return
    const start = ta.selectionStart, end = ta.selectionEnd
    const before = content.slice(0, start)
    const sel = content.slice(start, end)
    const after = content.slice(end)
    setContent(before + markLeft + sel + markRight + after)
    setTimeout(()=>{ ta.focus(); ta.setSelectionRange(start+markLeft.length, end+markLeft.length) }, 0)
  }

  return (
    <div className="container grid gap-3">
      <h2 className="font-black text-candy-700">{isEditing ? 'Modifier le poème' : 'Nouveau poème'}</h2>

      <div className="fixed left-1/2 -translate-x-1/2 top-[calc(env(safe-area-inset-top)+8px)] z-[2000]">
        <div className="rounded-2xl shadow-candy bg-white/95 backdrop-blur flex gap-2 px-3 py-2">
          <button className="px-3 py-1 rounded-lg font-bold" onClick={()=>surround('**')}>B</button>
          <button className="px-3 py-1 rounded-lg italic" onClick={()=>surround('_')}>i</button>
          <button className="px-3 py-1 rounded-lg" onClick={()=>surround('<div style=\"text-align:center\">','</div>')}>Centrer</button>
        </div>
      </div>
      <div className="h-14" />

      <div className="grid gap-2">
        <input
          className="rounded-2xl border px-3 py-3"
          placeholder="Titre"
          value={title}
          onChange={e=>setTitle(e.target.value)}
        />

        {/* Zone d'écriture */}
        <div className="grid gap-2">
        <textarea
          ref={taRef}
          className="w-full rounded-2xl border px-3 py-3 min-h-[60vh]"
          value={content}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
          onChange={e=>setContent(e.target.value)}
          placeholder="Ton texte (Markdown). Entrée = nouveau vers."
        />
      </div>
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={saveDraft}>Enregistrer brouillon</button>
        <button className="btn btn-primary" onClick={onPublish}>Publier</button>
        {isEditing && poemId && (
          <button className="btn btn-outline ml-auto" onClick={async ()=>{
            const ok = confirm('Supprimer ce poème ?')
            if(!ok) return
            await deletePoem(poemId)
            nav('/poems')
          }}>Supprimer</button>
        )}
      </div>

      <section className="card">
        <h3 className="font-bold mb-2">Aperçu</h3>
        <div className="prose prose-p:leading-7 prose-h1:mt-0 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: (props) => <p className="whitespace-pre-wrap leading-7">{props.children}</p>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </section>

      {/* Toast simple */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[2000]">
          <div className="rounded-2xl bg-black/80 text-white px-4 py-2 shadow-candy">{toast}</div>
        </div>
      )}
    </div>
  )
}
