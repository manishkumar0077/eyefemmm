
import React, { useEffect, useState } from 'react';
import { Puck, Config } from '@measured/puck';
import '@measured/puck/puck.css';
import { Block, fetchPageBlocks, savePageBlocks, saveSingleBlock } from '@/integrations/supabase/blocks';
import { toast } from '@/hooks/use-toast';
import '../../../styles/puck-editor.css';

interface PuckEditorProps {
  pagePath: string;
  blocks: Block[];
  onSave: () => void;
  onCancel: () => void;
  onBlocksChange?: (newBlocks: any[]) => void;
}

const blockConfig: Config = {
  components: {
    Heading: {
      fields: {
        text: { type: 'text', label: 'Heading Text' },
        level: {
          type: 'select',
          label: 'Heading Level',
          options: [
            { label: 'H1', value: 'h1' },
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
            { label: 'H4', value: 'h4' },
            { label: 'H5', value: 'h5' },
            { label: 'H6', value: 'h6' }
          ]
        }
      },
      render: ({ text, level = 'h2' }) => {
        const Tag = level as keyof JSX.IntrinsicElements;
        return <Tag className="puck-heading">{text}</Tag>;
      }
    },
    Paragraph: {
      fields: {
        text: { type: 'textarea', label: 'Paragraph Text' }
      },
      render: ({ text }) => (
        <p className="puck-paragraph">{text}</p>
      )
    },
    Image: {
      fields: {
        src: { type: 'text', label: 'Image URL' },
        alt: { type: 'text', label: 'Alt Text' }
      },
      render: ({ src, alt }) => (
        <img src={src} alt={alt} className="puck-image" />
      )
    },
    Button: {
      fields: {
        text: { type: 'text', label: 'Button Text' },
        url: { type: 'text', label: 'URL' },
        variant: {
          type: 'select',
          label: 'Variant',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' }
          ]
        }
      },
      render: ({ text, url, variant = 'default' }) => (
        <button className={`puck-button puck-button-${variant}`} onClick={() => url && window.open(url)}>
          {text}
        </button>
      )
    }
  }
};

export const PuckEditor = ({ pagePath, blocks, onSave, onCancel, onBlocksChange }: PuckEditorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleChange = async (data: any) => {
    if (!lastSaveTime || new Date().getTime() - lastSaveTime.getTime() > 1000) {
      try {
        setLastSaveTime(new Date());
        if (onBlocksChange) {
          onBlocksChange(data.root.content);
        }
      } catch (error) {
        console.error('Error handling change:', error);
      }
    }
  };

  const handlePublish = async (data: any) => {
    try {
      setIsSaving(true);
      await savePageBlocks(pagePath, data.root.content);
      if (onBlocksChange) {
        onBlocksChange(data.root.content);
      }
      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
      });
      onSave();
    } catch (error) {
      console.error('Error saving blocks:', error);
      toast({
        title: "Error saving changes",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const initialData = {
    root: {
      props: {},
      content: blocks.map(block => ({
        ...block.content,
        id: block.id,
        type: block.type
      }))
    }
  };

  // Use the className prop to apply different styles based on preview mode
  const editorClassName = isPreviewMode ? "puck-editor-preview-mode" : "puck-editor-edit-mode";

  return (
    <div className={`puck-editor-container ${editorClassName}`}>
      <Puck
        config={blockConfig}
        data={initialData}
        onPublish={handlePublish}
        onChange={handleChange}
        renderHeader={() => (
          <div className="puck-header">
            <h2>Visual Editor - {pagePath}</h2>
            <div className="puck-header-actions">
              <button
                className="preview-button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
              <button 
                className="cancel-button" 
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="save-button" 
                onClick={() => {
                  const submitButton = document.querySelector('.puck-publish-button');
                  if (submitButton instanceof HTMLElement) {
                    submitButton.click();
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
        // We can't use viewMode directly as it's not supported in the Puck component API
      />
    </div>
  );
};
