'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash, GripVertical, Type, AlignLeft, Hash, Phone, Mail } from 'lucide-react';
import { FormField } from '@/types/models';

interface Props {
  initialFields?: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function ServiceFormBuilder({ initialFields = [], onChange }: Props) {
  const [fields, setFields] = useState<FormField[]>(initialFields);

  useEffect(() => {
    onChange(fields);
  }, [fields, onChange]);

  const addField = () => {
    setFields([...fields, { key: '', label: '', type: 'text', required: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FormField, value: string | boolean) => {
    const newFields = [...fields];
    
    
    newFields[index] = { ...newFields[index], [key]: value };

    // Auto-generar KEY (slug) des del Label
    if (key === 'label' && typeof value === 'string') {
        const slug = value
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '_');
        newFields[index].key = slug;
    }

    setFields(newFields);
  };

  const getIcon = (type: string) => {
    switch(type) {
        case 'text': return <Type size={14} />;
        case 'textarea': return <AlignLeft size={14} />;
        case 'number': return <Hash size={14} />;
        case 'tel': return <Phone size={14} />;
        case 'email': return <Mail size={14} />;
        default: return <Type size={14} />;
    }
  };

  return (
    <div className="space-y-4 border border-border p-5 rounded-xl bg-slate-50/50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm text-slate-900">Formulari Personalitzat</h3>
        <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{fields.length} camps</span>
      </div>
      
      <div className="space-y-3">
        {fields.map((field, idx) => (
            <div key={idx} className="group flex gap-3 items-start bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-primary/30 transition-colors">
                <div className="mt-3 text-slate-300 cursor-move group-hover:text-slate-400">
                    <GripVertical size={16} />
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <input 
                                placeholder="Nom del camp (ex: Matrícula)" 
                                className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                value={field.label}
                                onChange={(e) => updateField(idx, 'label', e.target.value)}
                            />
                        </div>
                        <div className="w-1/3">
                            <div className="relative">
                                <select 
                                    className="w-full p-2 pl-8 border border-slate-200 rounded-md text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                                    value={field.type}
                                    onChange={(e) => updateField(idx, 'type', e.target.value)}
                                >
                                    <option value="text">Text Curt</option>
                                    <option value="textarea">Text Llarg</option>
                                    <option value="number">Número</option>
                                    <option value="tel">Telèfon</option>
                                    <option value="email">Email</option>
                                </select>
                                <div className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none">
                                    {getIcon(field.type)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                             <span className="text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                key: {field.key || '...'}
                            </span>
                            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer hover:text-slate-900">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                    checked={field.required} 
                                    onChange={(e) => updateField(idx, 'required', e.target.checked)}
                                /> 
                                Obligatori
                            </label>
                        </div>
                        
                        <button 
                            type="button" 
                            onClick={() => removeField(idx)} 
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                        >
                            <Trash size={12} /> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <button 
        type="button" 
        onClick={addField} 
        className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 border-dashed rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
      >
        <Plus size={16} /> Afegir Camp
      </button>
    </div>
  );
}