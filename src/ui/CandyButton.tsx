import { motion } from 'framer-motion'
export default function CandyButton({children, className='', ...p}: any){
  return (
    <motion.button whileTap={{ scale: 0.94 }} whileHover={{ y: -2 }}
      className={`btn ${className}`} {...p}>{children}</motion.button>
  )
}
