import { PageHeader_Muted } from "./PageHeader_Muted";

interface FormEditorPageProps {
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'post-meeting' | 'wind-down' | 'chat') => void;
  onBack?: () => void;
}

export function FormEditorPage({ onQuickAddSelect, onJamieAction, onBack }: FormEditorPageProps) {
  return (
    <div className="flex h-full overflow-hidden flex-col">
      {/* Header */}
      <PageHeader_Muted
        title="Form Editor"
        onQuickAddSelect={onQuickAddSelect}
        onJamieAction={onJamieAction}
        onBack={onBack}
        showBackButton={!!onBack}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[rgb(247,247,249)] p-8">
        <div className="max-w-6xl mx-auto">
          {/* Content will go here */}
        </div>
      </div>
    </div>
  );
}