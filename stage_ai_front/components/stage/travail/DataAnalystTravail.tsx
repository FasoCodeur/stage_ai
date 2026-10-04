"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, TableProperties } from "lucide-react"

interface DataAnalystTravailProps {
  stage: any
}

export default function DataAnalystTravail({ stage }: DataAnalystTravailProps) {
  const base = (stage?.missionCourante?.domainData?.data as string[][]) || [
    ["Variable", "Valeur"],
    ["", ""],
  ]
  const [rows, setRows] = useState<string[][]>(base)

  const updateCell = (r: number, c: number, val: string) => {
    setRows((prev) => prev.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? val : cell)) : row)))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <TableProperties className="size-4" />
        <CardTitle className="text-base">Tableur de données</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md overflow-auto max-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                {(rows[0] || ["", ""]).map((_, ci) => (
                  <TableHead key={ci}>Col {ci + 1}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, ri) => (
                <TableRow key={ri}>
                  {row.map((cell, ci) => (
                    <TableCell key={ci} className="p-0">
                      <input
                        className="w-full min-w-[100px] px-2 py-1 text-sm bg-transparent outline-none focus:bg-muted"
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setRows((p) => [...p, Array(rows[0]?.length || 2).fill("")])}>
            + Ajouter une ligne
          </Button>
          <Button size="sm">
            <Save className="size-4" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}