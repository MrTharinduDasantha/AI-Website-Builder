import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Project } from "../types";
import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  LoaderIcon,
  MessageSquareIcon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ProjectPreview, {
  type ProjectPreviewRef,
} from "../components/ProjectPreview";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Projects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop",
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const previewRef = useRef<ProjectPreviewRef>(null);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${projectId}`);
      setProject(data.project);
      setIsGenerating(data.project.current_code ? false : true);
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.error(error);
    }
  };

  const saveProject = async () => {
    if (!previewRef.current) return;

    const code = previewRef.current.getCode();
    if (!code) return;
    setIsSaving(true);

    try {
      const { data } = await api.put(`/api/project/save/${projectId}`, {
        code,
      });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Download code (index.html)
  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) {
      if (isGenerating) return;
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
  };

  const togglePublish = async () => {
    try {
      const { data } = await api.get(`/api/user/publish-toggle/${projectId}`);
      toast.success(data.message);
      setProject((prev) =>
        prev ? { ...prev, isPublished: !prev.isPublished } : null,
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    if (session?.user) fetchProject();
    else if (!isPending && !session?.user) {
      navigate("/");
      toast.error("Please login to view your projects");
    }
  }, [session?.user]);

  useEffect(() => {
    if (project && !project.current_code) {
      const intervalId = setInterval(fetchProject, 10000);
      return () => clearInterval(intervalId);
    }
  }, [project]);

  if (loading)
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <Loader2Icon className="size-7 animate-spin text-violet-200" />
        </div>
      </>
    );
  return project ? (
    <div className="flex flex-col h-screen w-full bg-gray-800 text-white">
      {/* Builder Navbar */}
      <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar">
        {/* Left */}
        <div className="flex items-center gap-2 sm:min-w-90 text-nowrap">
          <img
            onClick={() => navigate("/")}
            src="/favicon.svg"
            className="h-6 cursor-pointer"
            alt="Logo"
          />
          <div className="max-w-64 sm:max-w-xs">
            <p className="text-sm font-medium capitalize truncate">
              {project.name}
            </p>
            <p className="text-xs text-gray-400 -mt-0.5">
              Previewing last saved version
            </p>
          </div>
          <div className="sm:hidden flex-1 flex justify-end">
            {isMenuOpen ? (
              <MessageSquareIcon
                onClick={() => setIsMenuOpen(false)}
                className="size-6 cursor-pointer"
              />
            ) : (
              <XIcon
                onClick={() => setIsMenuOpen(true)}
                className="size-6 cursor-pointer"
              />
            )}
          </div>
        </div>
        {/* Middle */}
        <div className="hidden sm:flex gap-2 bg-gray-900 p-1.5 rounded-md">
          <SmartphoneIcon
            onClick={() => setDevice("phone")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "phone" ? "bg-gray-700" : ""}`}
          />
          <TabletIcon
            onClick={() => setDevice("tablet")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "tablet" ? "bg-gray-700" : ""}`}
          />
          <LaptopIcon
            onClick={() => setDevice("desktop")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "desktop" ? "bg-gray-700" : ""}`}
          />
        </div>
        {/* Right */}
        <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
          <button
            onClick={saveProject}
            disabled={isSaving}
            className="max-sm:hidden bg-gray-700 hover:bg-gray-900 px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <LoaderIcon size={16} className="animate-spin" />
            ) : (
              <SaveIcon size={16} />
            )}{" "}
            Save
          </button>
          <Link
            target="_blank"
            to={`/preview/${projectId}`}
            className="bg-green-700 hover:bg-green-900 px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors"
          >
            <FullscreenIcon size={16} /> Preview
          </Link>
          <button
            onClick={downloadCode}
            className="bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors"
          >
            <ArrowBigDownDashIcon size={16} /> Download
          </button>
          <button
            onClick={togglePublish}
            className="bg-linear-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors"
          >
            {project.isPublished ? (
              <EyeOffIcon size={16} />
            ) : (
              <EyeIcon size={16} />
            )}
            {project.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-auto">
        <Sidebar
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={(p) => setProject(p)}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
        <div className="flex-1 p-2 pl-0">
          <ProjectPreview
            project={project}
            isGenerating={isGenerating}
            device={device}
            ref={previewRef}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-200">
        Unable to load project!
      </p>
    </div>
  );
};

export default Projects;
