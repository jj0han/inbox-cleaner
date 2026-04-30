"use client";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActionCardProps {
  title: string;
  description: string;
  onPreviewClick: () => void;
}

export function ActionCard({ title, description, onPreviewClick }: ActionCardProps) {
  return (
    <Card className="flex flex-col border-zinc-200 shadow-sm transition-shadow hover:shadow-md h-full">
      <CardHeader className="flex-1 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">{title}</CardTitle>
        <CardDescription className="text-sm font-medium text-zinc-500 mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-4 border-t border-zinc-100">
        <Button variant="default" onClick={onPreviewClick} className="w-full font-semibold">
          Ver E-mails
        </Button>
      </CardFooter>
    </Card>
  );
}
