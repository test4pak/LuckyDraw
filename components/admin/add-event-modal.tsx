"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEventModal({ isOpen, onClose, onSuccess }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"running" | "upcoming" | "completed">("upcoming");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!endDate) {
      newErrors.endDate = "End date is required";
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("events").insert([
        {
          title: title.trim(),
          description: description.trim(),
          status,
          start_date: startDate,
          end_date: endDate,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setStatus("upcoming");
      setStartDate("");
      setEndDate("");
      setErrors({});

      onSuccess();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl bg-slate-800 rounded-lg shadow-2xl overflow-hidden pointer-events-auto border border-slate-700 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-slate-700 p-4 sm:p-6 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Add New Event</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Title *
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors({ ...errors, title: "" });
                    }}
                    className={`bg-slate-900 text-white placeholder:text-slate-500 border-slate-600 ${errors.title ? "border-red-500" : ""}`}
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors({ ...errors, description: "" });
                    }}
                    className={`w-full min-h-[100px] px-3 py-2 rounded-md border bg-slate-900 text-white placeholder:text-slate-500 ${
                      errors.description ? "border-red-500" : "border-slate-600"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                    placeholder="Enter event description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "running" | "upcoming" | "completed")}
                    className="w-full px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (errors.startDate) setErrors({ ...errors, startDate: "" });
                      }}
                      className={`bg-slate-900 text-white border-slate-600 ${errors.startDate ? "border-red-500" : ""}`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-destructive">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (errors.endDate) setErrors({ ...errors, endDate: "" });
                      }}
                      className={`bg-slate-900 text-white border-slate-600 ${errors.endDate ? "border-red-500" : ""}`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-destructive">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {loading ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

