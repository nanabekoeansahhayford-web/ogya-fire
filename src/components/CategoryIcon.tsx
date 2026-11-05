import React from 'react';
import {
  Car,
  Building2,
  Smartphone,
  Laptop,
  Armchair,
  Shirt,
  Sparkles,
  Briefcase,
  Hammer,
  Wrench,
  Compass,
  Baby,
  Wheat,
  Dog,
  BriefcaseBusiness,
  FileText,
  Factory,
  Grid
} from 'lucide-react';
import { CategoryId } from '../types/marketplace';

interface Props {
  categoryId?: CategoryId | 'all';
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<Props> = ({ categoryId, className = 'w-5 h-5', size = 20 }) => {
  switch (categoryId) {
    case 'vehicles':
      return <Car className={className} size={size} />;
    case 'property':
      return <Building2 className={className} size={size} />;
    case 'phones-tablets':
      return <Smartphone className={className} size={size} />;
    case 'electronics':
      return <Laptop className={className} size={size} />;
    case 'home-furniture':
      return <Armchair className={className} size={size} />;
    case 'fashion':
      return <Shirt className={className} size={size} />;
    case 'beauty-care':
      return <Sparkles className={className} size={size} />;
    case 'services':
      return <Briefcase className={className} size={size} />;
    case 'repair-construction':
      return <Hammer className={className} size={size} />;
    case 'commercial-equipment':
      return <Wrench className={className} size={size} />;
    case 'leisure-activities':
      return <Compass className={className} size={size} />;
    case 'babies-kids':
      return <Baby className={className} size={size} />;
    case 'food-agriculture':
      return <Wheat className={className} size={size} />;
    case 'animals-pets':
      return <Dog className={className} size={size} />;
    case 'jobs':
      return <BriefcaseBusiness className={className} size={size} />;
    case 'seeking-work-cvs':
      return <FileText className={className} size={size} />;
    case 'business-industry':
      return <Factory className={className} size={size} />;
    default:
      return <Grid className={className} size={size} />;
  }
};
