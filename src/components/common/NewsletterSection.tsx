import React, { useState } from 'react';
import { Mail, Check, Loader2, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface NewsletterSectionProps {
  source?: string;
}

export default function NewsletterSection({ source = 'Homepage' }: NewsletterSectionProps) {
  return null;
}
