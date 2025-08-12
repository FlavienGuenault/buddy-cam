import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { supabase } from '../lib/supabase'
import { deletePoem } from '../lib/db'
import type { Poem } from '../lib/types'

function whoFromEmail(email?: string|null): 'Buddy'|'Camélia'|'Autre' {
  if (!email) return 'Autre'
  const e = email.toLowerCase()
  if (e.startsWith('flavien')) return 'Buddy'
  if (e.startsWith('louane'))  return 'Camélia'
  return 'Autre'
}

export default function PoemView(){
  const nav = useNavigate()
  const { id } = useParams()
  const [poem, setPoem] = useState<Poem | null>(null)
  const [meId, setMeId] = useState<string|undefined>(undefined)
  const [meEmail, setMeEmail] = useState<string|undefined>(undefined)

  useEffect(()=>{ (async ()=>{
    const u = await supabase.auth.getUser()
    setMeId(u.data.user?.id); setMeEmail(u.data.user?.email ?? undefined)
    const { data, error } = await supabase.from('poems').select('*').eq('id', id).single()
    if (error) throw error
    setPoem(data as Poem)
  })() }, [id])

  if (!poem) return null

  const me = whoFromEmail(meEmail)
  const isOwner = meId === poem.author_id
  const authorLabel = isOwner ? me : 'Autre' // on distingue visuel ci-dessous

  const badge =
    poem.author_id === meId
      ? <span className="inline-flex items-center gap-1 text-white text-[11px] px-2 py-0.5 rounded-full bg-amber-600">• Buddy</span>
      : <span className="inline-flex items-center gap-1 text-white text-[11px] px-2 py-0.5 rounded-full bg-rose-900">• Camélia</span>

  return (
    <div className="container max-w-2xl">
    <div className="mb-2">
        <Link to="/poems" className="text-sm opacity-70 hover:opacity-100">← Retour aux poèmes</Link>
    </div>
      <header className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{poem.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs opacity-70">
            {badge}
            <span>{new Date(poem.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <>
              <Link className="btn" to={`/poems/edit/${poem.id}`}>Modifier</Link>
              <button className="btn btn-outline" onClick={async ()=>{
                const ok = confirm('Supprimer ce poème ?')
                if(!ok) return
                await deletePoem(poem.id)
                nav('/poems')
              }}>Supprimer</button>
            </>
          )}
        </div>
      </header>

      <article className="prose prose-p:leading-7 prose-h1:mt-0 max-w-none">
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            allowedElements={['br','strong','em','del','code','span','div','a']}
            unwrapDisallowed
            components={{
                br: (props) => <br />,
                span: (props) => <span className="whitespace-pre-wrap">{props.children}</span>,
                div: (props) => <div {...props} />,
            }}
            >
            {poem.content.replace(/\r\n/g, '\n')}
        </ReactMarkdown>
      </article>
    </div>
  )
}
