import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, ResourceItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Library, BookOpen, Download, Link as LinkIcon, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/resources")({
  component: ResourcesPage,
});

function ResourcesPage() {
  // Store States
  const resources = useStore((s) => s.resources);
  const addResource = useStore((s) => s.addResource);
  const deleteResource = useStore((s) => s.deleteResource);

  // Local UI States
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const [form, setForm] = useState({
    title: "",
    category: "Book" as ResourceItem["category"],
    subject: "",
    url: "",
  });

  const handleAddResource = () => {
    if (!form.title.trim() || !form.subject.trim()) {
      toast.error("Enter a title and subject tag");
      return;
    }
    addResource({
      title: form.title,
      category: form.category,
      subject: form.subject,
      url: form.url || "#",
    });
    toast.success("Resource bookmark registered!");
    setForm({ title: "", category: "Book", subject: "", url: "" });
    setOpen(false);
  };

  const handleDownloadMock = (item: ResourceItem) => {
    if (item.category === "Link" || (item.url && item.url !== "#" && item.url.startsWith("http"))) {
      window.open(item.url, "_blank");
      toast.success(`Opening reference link: "${item.title}"`);
      return;
    }
    // Generate text content for the downloaded file
    const fileContent = `Syntra Student OS - Document Download
======================================
Title: ${item.title}
Subject: ${item.subject}
Category: ${item.category}
Date downloaded: ${new Date().toLocaleString()}

This is a dynamically generated offline placeholder resource for "${item.title}".
In a full production build, this would retrieve the scanned PDF/document matching the archive.
For testing and demonstration, you can read this text file which acts as the downloaded asset.`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_resource.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    toast.success(`Downloaded asset: ${item.title}`);
  };

  // Filtration logic
  const filtered = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl select-none">
      
      {/* Top headers */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Resource Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Centralize syllabus documents, past examination papers, and bookmark link repositories.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white border-0 shadow">
              <Plus className="h-4 w-4 mr-1" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Resource Bookmark</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title / Filename</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Operating Systems Syllabus" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v: ResourceItem["category"]) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Syllabus">🏫 Syllabus</SelectItem>
                      <SelectItem value="Past Paper">📄 Past Paper</SelectItem>
                      <SelectItem value="Book">📚 Textbook</SelectItem>
                      <SelectItem value="Link">🔗 Reference Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject Tag</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Operating Systems" />
                </div>
              </div>
              <div>
                <Label>External Link / URL</Label>
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/pdf" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAddResource}>Save Resource</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative text-left">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search resources by title or subject..." 
            className="pl-9 h-9" 
          />
        </div>

        <div className="flex gap-1.5 rounded-lg border bg-card p-1">
          {["All", "Syllabus", "Past Paper", "Book", "Link"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                categoryFilter === cat ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of files */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition text-left flex flex-col justify-between min-h-[130px]">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">{item.subject}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  item.category === "Syllabus" ? "bg-primary/10 text-primary" :
                  item.category === "Past Paper" ? "bg-warning/10 text-warning" :
                  item.category === "Book" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                }`}>
                  {item.category}
                </span>
              </div>
              <h4 className="font-bold text-sm mt-2 leading-snug">{item.title}</h4>
            </div>

            <div className="flex justify-between items-center pt-3 border-t mt-4 text-xs">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDownloadMock(item)}
                className="h-7 text-[10px] text-primary hover:bg-primary/10 gap-1 font-bold"
              >
                {item.category === "Link" ? <LinkIcon className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                {item.category === "Link" ? "Open Link" : "Download PDF"}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => deleteResource(item.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
