// All hardware supply types and their field definitions

export const SUPPLY_TYPES = [
  { id: 'expansionBolts', label: 'Expansion Bolts' },
  { id: 'glueInBolts', label: 'Glue-in Bolts' },
  { id: 'hangers', label: 'Hangers' },
  { id: 'chain', label: 'Chain' },
  { id: 'quickLinks', label: 'Quick Links' },
  { id: 'permadraws', label: 'Permadraws' },
  { id: 'anchors', label: 'Anchors & Rappel Rings' },
  { id: 'other', label: 'Other' },
]

export const HARDWARE_FIELDS = {
  expansionBolts: {
    label: 'Expansion Bolts',
    color: '#c4521a',
    fields: [
      {
        id: 'boltType', label: 'Bolt Type', type: 'radio', required: true,
        options: ['3/8" Mechanical Anchor', '1/2" Mechanical Anchor', '10mm Mechanical Anchor', '12mm Mechanical Anchor', 'Other'],
      },
      {
        id: 'boltMaterial', label: 'Bolt Material', type: 'radio', required: true,
        options: ['304 Stainless Steel', '316 Stainless Steel', 'Other'],
      },
      {
        id: 'boltLength', label: 'Bolt Length', type: 'radio', required: true,
        options: ['3"', '3-1/2"', 'Other'],
      },
      {
        id: 'boltBrand', label: 'Bolt Brand', type: 'radio', required: true,
        options: ['Hilti', 'Dewalt', 'Other'],
      },
      { id: 'quantity', label: 'Quantity', type: 'integer', required: true },
      { id: 'costEach', label: 'Cost (each)', type: 'currency', required: true },
    ]
  },
  glueInBolts: {
    label: 'Glue-in Bolts',
    color: '#7ea8c4',
    fields: [
      {
        id: 'glueInType', label: 'Glue-in Type', type: 'radio', required: true,
        options: ['10mm Glue-in', '12mm Glue-in', '1/2" Glue-in', 'Wave Bolt', 'Other'],
      },
      {
        id: 'glueInMaterial', label: 'Glue-in Material', type: 'radio', required: true,
        options: ['304 Stainless Steel', '316 Stainless Steel', 'Other'],
      },
      {
        id: 'glueInLength', label: 'Glue-in Length', type: 'radio', required: true,
        options: ['80mm', '100mm', '120mm', '150mm', 'Other'],
      },
      {
        id: 'glueInBrand', label: 'Glue-in Brand', type: 'radio', required: true,
        options: ['Fixe', 'Vertical Evolution', 'Bolt Products', 'AustriAlpine', 'Other'],
      },
      {
        id: 'epoxyUsed', label: 'Epoxy Used', type: 'radio', required: true,
        options: ['Dewalt AC100+', 'Sika AnchorFix 2020', 'Other'],
      },
      { id: 'quantity', label: 'Quantity', type: 'integer', required: true },
      { id: 'costEach', label: 'Cost (each)', type: 'currency', required: true },
    ]
  },
  hangers: {
    label: 'Hangers',
    color: '#4a5c3a',
    fields: [
      {
        id: 'hangerType', label: 'Hanger Type', type: 'radio', required: true,
        options: ['3/8" Hanger', '1/2" Hanger', '10mm Hanger', '12mm Hanger', 'Other'],
      },
      {
        id: 'hangerMaterial', label: 'Hanger Material', type: 'radio', required: true,
        options: ['304 Stainless Steel', '316 Stainless Steel', 'Other'],
      },
      {
        id: 'brandModel', label: 'Brand / Model', type: 'radio', required: true,
        options: ['Fixe', 'Petzl', 'Mad Rock', 'Metolius', 'Other'],
      },
      { id: 'quantity', label: 'Quantity', type: 'integer', required: true },
      { id: 'costEach', label: 'Cost (each)', type: 'currency', required: true },
    ]
  },
  chain: {
    label: 'Chain',
    color: '#8a7060',
    fields: [
      {
        id: 'chainSize', label: 'Chain Size', type: 'radio', required: true,
        options: ['1/4"', '5/16"', '3/8"', '8mm', '10mm', 'Other'],
      },
      {
        id: 'chainGrade', label: 'Chain Grade', type: 'radio', required: true,
        options: ['Grade 30', 'Grade 43', 'Grade 70', 'Grade 80', 'Other'],
      },
      {
        id: 'chainMaterial', label: 'Chain Material', type: 'radio', required: true,
        options: ['304 Stainless Steel', '316 Stainless Steel', 'Galvanized Steel', 'Other'],
      },
      { id: 'quantity', label: 'Quantity (links)', type: 'integer', required: true },
      { id: 'costEach', label: 'Cost (per link)', type: 'currency', required: true },
    ]
  },
  quickLinks: {
    label: 'Quick Links',
    color: '#a87840',
    fields: [
      {
        id: 'quickLinkSize', label: 'Quick Link Size', type: 'radio', required: true,
        options: ['5/16"', '3/8"', '8mm', '10mm', 'Other'],
      },
      {
        id: 'quickLinkMaterial', label: 'Quick Link Material', type: 'radio', required: true,
        options: ['Stainless Steel', 'Galvanized Steel', 'Other'],
      },
      { id: 'quantity', label: 'Quantity', type: 'integer', required: true },
      { id: 'costEach', label: 'Cost (each)', type: 'currency', required: true },
    ]
  },
  permadraws: {
    label: 'Permadraws',
    color: '#6070a0',
    fields: [
      {
        id: 'permadrawType', label: 'Permadraw Type', type: 'radio', required: true,
        options: ['Cable Dog Bone', 'Chain Dog Bone', 'Carabiner'],
        conditional: {
          'Cable Dog Bone': [
            {
              id: 'cableBrand', label: 'Cable Brand', type: 'radio', required: true,
              options: ['Lappas', 'Camp', 'Other'],
            },
            {
              id: 'cableMaterial', label: 'Cable Material', type: 'radio', required: true,
              options: ['Galvanized Steel', 'Stainless Steel', 'Other'],
            },
          ],
          'Chain Dog Bone': [
            {
              id: 'permadrawChainSize', label: 'Chain Size', type: 'radio', required: true,
              options: ['1/4"', '5/16"', '3/8"', '8mm', '10mm', 'Other'],
            },
            {
              id: 'permadrawChainGrade', label: 'Chain Grade', type: 'radio', required: true,
              options: ['Grade 30', 'Grade 43', 'Grade 70', 'Grade 80', 'Other'],
            },
            {
              id: 'permadrawChainMaterial', label: 'Chain Material', type: 'radio', required: true,
              options: ['304 Stainless Steel', '316 Stainless Steel', 'Galvanized Steel', 'Other'],
            },
          ],
          'Carabiner': [
            {
              id: 'carabinerMaterial', label: 'Carabiner Material', type: 'radio', required: true,
              options: ['Steel', 'Stainless Steel', 'Aluminum', 'Other'],
            },
          ],
        }
      },
      { id: 'quantity', label: 'Quantity', type: 'integer', required: true },
      { id: 'costEach', label: 'Cost (each)', type: 'currency', required: true },
    ]
  },
  anchors: {
    label: 'Anchors & Rappel Rings',
    color: '#508080',
    fields: [
      {
        id: 'anchorType', label: 'Anchor Type', type: 'radio', required: true,
        options: ['Rappel Ring', 'Hanger with Rappel Ring', 'Other'],
      },
      {
        id: 'anchorMaterial', label: 'Anchor Material', type: 'radio', required: true,
        options: ['304 Stainless Steel', '316 Stainless Steel', 'Other'],
      },
      { id: 'quantity', label: 'Quantity', type: 'integer', required: true },
      { id: 'costEach', label: 'Cost (per set)', type: 'currency', required: true },
    ]
  },
  other: {
    label: 'Other',
    color: '#706070',
    fields: [
      { id: 'description', label: 'Item Description', type: 'text', required: true, placeholder: 'Describe the supply item' },
      { id: 'quantity', label: 'Quantity', type: 'integer', required: true },
      { id: 'costEach', label: 'Cost (each)', type: 'currency', required: true },
    ]
  },
}

export function createHardwareItem(type) {
  return {
    id: Date.now() + Math.random(),
    type,
    values: {},
    otherValues: {},
  }
}

export function calcItemTotal(item) {
  const qty = parseFloat(item.values.quantity) || 0
  const cost = parseFloat(item.values.costEach) || 0
  return qty * cost
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount)
}
