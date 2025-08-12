import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { supabase } from '../lib/supabase'
import type { Poem } from '../lib/types'

export default function PoemView(){
  const { id } = useParams()
  const [poem, setPoem] = useState<Poem | null>(null)

  useEffect(()=>{ (async ()=>{
    const { data, error } = await supabase.from('poems').select('*').eq('id', id).single()
    if (error) throw error
    setPoem(data as Poem)
  })() }, [id])

  if (!poem) return null

  return (
    <div className="container prose max-w-none">
      <h1>{poem.title}</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
        {poem.content}
      </ReactMarkdown>
    </div>
  )
}