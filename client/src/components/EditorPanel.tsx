import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface EditorPanelProps {
  selectedElement: {
    tagName: string;
    className: string;
    text: string;
    styles: {
      padding: string;
      margin: string;
      backgroundColor: string;
      color: string;
      fontSize: string;
    };
  } | null;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const EditorPanel = ({
  selectedElement,
  onUpdate,
  onClose,
}: EditorPanelProps) => {
  const [values, setValues] = useState(selectedElement);

  useEffect(() => {
    setValues(selectedElement);
  }, [selectedElement]);

  if (!selectedElement || !values) return null;

  const handleChange = (field: string, value: string) => {
    const newValues = { ...values, [field]: value };
    if (field in values.styles)
      newValues.styles = { ...values.styles, [field]: value };

    setValues(newValues);
    onUpdate({ [field]: value });
  };

  const handleStyleChange = (styleName: string, value: string) => {
    const newStyles = { ...values.styles, [styleName]: value };
    setValues({ ...values, styles: newStyles });
    onUpdate({ styles: { [styleName]: value } });
  };
  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-fade-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Edit Element</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="space-y-4 text-black">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Text Content
          </label>
          <textarea
            onChange={(e) => handleChange("text", e.target.value)}
            value={values.text}
            className="w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none min-h-20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Class Name
          </label>
          <input
            onChange={(e) => handleChange("className", e.target.value)}
            value={values.className || ""}
            type="text"
            className="w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Padding
            </label>
            <input
              onChange={(e) => handleStyleChange("padding", e.target.value)}
              value={values.styles.padding}
              type="text"
              className="w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Margin
            </label>
            <input
              onChange={(e) => handleStyleChange("margin", e.target.value)}
              value={values.styles.margin}
              type="text"
              className="w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Font Size
            </label>
            <input
              onChange={(e) => handleStyleChange("fontSize", e.target.value)}
              value={values.styles.fontSize}
              type="text"
              className="w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Background
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-md p-1">
              <input
                onChange={(e) =>
                  handleStyleChange("backgroundColor", e.target.value)
                }
                value={
                  values.styles.backgroundColor === "rgba(0, 0, 0, 0)"
                    ? "#ffffff"
                    : values.styles.backgroundColor
                }
                type="color"
                className="w-6 h-6 cursor-pointer"
              />
              <span className="text-xs to-gray-600 truncate">
                {values.styles.backgroundColor}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-md p-1">
              <input
                onChange={(e) => handleStyleChange("color", e.target.value)}
                value={values.styles.color}
                type="color"
                className="w-6 h-6 cursor-pointer"
              />
              <span className="text-xs to-gray-600 truncate">
                {values.styles.color}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
