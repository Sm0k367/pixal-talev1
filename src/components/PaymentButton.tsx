import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

interface PaymentButtonProps {
  variant?: 'inline' | 'modal' | 'card'
  text?: string
}

export default function PaymentButton({ 
  variant = 'inline',
  text = 'Unlock Premium Features'
}: PaymentButtonProps) {
  const stripeRedirect = 'https://buy.stripe.com/aFa4gA4Ap7XU9pi5bk0Fi06'

  const handlePayment = () => {
    if (stripeRedirect) {
      window.open(stripeRedirect, '_blank')
    }
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border border-accent-cyan/30 hover:border-accent-cyan/50 transition-colors"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Premium Unlocked</h3>
        </div>
        <p className="text-white/70 mb-6">
          Access unlimited story generations, advanced modes, and exclusive features
        </p>
        <motion.button
          onClick={handlePayment}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          {text}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    )
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-950 border border-white/10 rounded-2xl p-8 max-w-md"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Premium Features</h2>
          <p className="text-white/70 mb-6">
            Unlock unlimited generations and exclusive creative modes
          </p>
          <motion.button
            onClick={handlePayment}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 mb-3"
          >
            {text}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Default inline variant
  return (
    <motion.button
      onClick={handlePayment}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple hover:shadow-lg hover:shadow-accent-cyan/50 text-dark-950 font-semibold flex items-center gap-2 transition-all"
    >
      <Sparkles className="w-4 h-4" />
      {text}
      <ArrowRight className="w-4 h-4" />
    </motion.button>
  )
}
