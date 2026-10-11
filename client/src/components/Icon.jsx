import {
  Compass, Stethoscope, Cpu, Microscope, Briefcase, GraduationCap, Palette, Scale, Leaf,
  ThumbsUp, HelpCircle, ThumbsDown, Home, ClipboardList, Gamepad2, Youtube, Star, Gift, User,
  LogOut, Search, Check, Lock, ArrowRight, ArrowLeft, ChevronRight, ChevronDown, Heart, Building2, MapPin,
  Sparkles, BarChart3, Video, Play, X, XCircle, Menu, CheckCircle2, Info, RotateCcw, ShieldCheck,
  Mail, Phone, School, Globe, SlidersHorizontal, TrendingUp, Clock, Bookmark, BookmarkCheck,
  CircleDollarSign, Target, CalendarClock, MonitorPlay, Wallet, ListVideo, Shuffle, ExternalLink,
  FileText, Lightbulb, AlertTriangle, MessageCircle, HeartPulse, Activity, Timer, Zap, Users,
  ShieldAlert, Gavel, FlaskConical, PenTool, DollarSign, Rocket, Wrench, BookOpen, Handshake,
  ClipboardCheck, BadgeCheck, Wifi, Battery, Eye, EyeOff, Flame, Award, Trophy,
  Bug, Coins, Paintbrush, Type, TreePine, Waves, Presentation, Megaphone, Droplet, Thermometer, FolderKanban, Hand, KeyRound
} from 'lucide-react';

const MAP = {
  Compass, Stethoscope, Cpu, Microscope, Briefcase, GraduationCap, Palette, Scale, Leaf,
  ThumbsUp, HelpCircle, ThumbsDown, Home, ClipboardList, Gamepad2, Youtube, Star, Gift, User,
  LogOut, Search, Check, Lock, ArrowRight, ArrowLeft, ChevronRight, ChevronDown, Heart, Building2, MapPin,
  Sparkles, BarChart3, Video, Play, X, XCircle, Menu, CheckCircle2, Info, RotateCcw, ShieldCheck,
  Mail, Phone, School, Globe, SlidersHorizontal, TrendingUp, Clock, Bookmark, BookmarkCheck,
  CircleDollarSign, Target, CalendarClock, MonitorPlay, Wallet, ListVideo, Shuffle, ExternalLink,
  FileText, Lightbulb, AlertTriangle, MessageCircle, HeartPulse, Activity, Timer, Zap, Users,
  ShieldAlert, Gavel, FlaskConical, PenTool, DollarSign, Rocket, Wrench, BookOpen, Handshake,
  ClipboardCheck, BadgeCheck, Wifi, Battery, Eye, EyeOff, Flame, Award, Trophy,
  Bug, Coins, Paintbrush, Type, TreePine, Waves, Presentation, Megaphone, Droplet, Thermometer, FolderKanban, Hand, KeyRound
};

export default function Icon({ name, size = 18, ...rest }) {
  const Cmp = MAP[name] || Compass;
  return <Cmp size={size} strokeWidth={2} {...rest} />;
}
