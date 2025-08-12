import { useEffect, useRef, useState } from 'react'
import { createPoem, updatePoem, publishPoem } from '../lib/db'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

export default function PoemEditor(){
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  async function onCreate(e: React.FormEvent){
    e.preventDefault()
    const p = await createPoem(title.trim())
    await updatePoem(p.id, { content })
    alert('Brouillon enregistré')
  }
  async function onPublish(){
    const ok = confirm('Publier ce poème ?')
    if (!ok) return
    const p = await createPoem(title.trim())
    await updatePoem(p.id, { content })
    await publishPoem(p.id)
    alert('Publié')
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
      <h2 className="font-black text-candy-700">Nouveau poème</h2>

      <div className="grid gap-2">
        <input className="rounded-2xl border px-3 py-3" placeholder="Titre" value={title} onChange={e=>setTitle(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn" onClick={()=>surround('**')}>Gras</button>
          <button className="btn" onClick={()=>surround('_')}>Italique</button>
          <button className="btn" onClick={()=>surround('<div style=\"text-align:center\">','</div>')}>Centrer</button>
        </div>
        <textarea ref={taRef} className="rounded-2xl border px-3 py-3 h-56" value={content} onChange={e=>setContent(e.target.value)} placeholder="Ton texte en Markdown..." />
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={onCreate}>Enregistrer brouillon</button>
        <button className="btn btn-primary" onClick={onPublish}>Publier</button>
      </div>

      <section className="card">
        <h3 className="font-bold mb-2">Aperçu</h3>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
          {content}
        </ReactMarkdown>
      </section>
    </div>
  )
}