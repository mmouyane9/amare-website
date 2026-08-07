import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const FILTER_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'visible', label: 'ظاهر' },
  { value: 'hidden', label: 'مخفي' },
]

interface Props {
  search: string
  onSearchChange: (value: string) => void
  filter: string
  onFilterChange: (value: string) => void
  columns: string[]
  selectedColumn: string
  onColumnChange: (value: string) => void
}

export default function FooterToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  columns,
  selectedColumn,
  onColumnChange,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="ابحث باسم الرابط أو الرابط..."
          className="h-9 pr-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={selectedColumn} onValueChange={onColumnChange}>
        <SelectTrigger className="h-9 w-full sm:w-40">
          <SelectValue placeholder="كل الأعمدة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الأعمدة</SelectItem>
          {columns.map((col) => (
            <SelectItem key={col} value={col}>
              {col}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="h-9 w-full sm:w-36">
          <SelectValue placeholder="تصفية" />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
