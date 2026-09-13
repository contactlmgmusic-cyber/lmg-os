begin;

revoke all privileges on table
  public.artist_approvals,
  public.artiste_documents,
  public.assets,
  public.bookings,
  public.campagnes,
  public.chat_channels,
  public.chat_messages,
  public.contract_approvals,
  public.contrats,
  public.drive_files,
  public.notifications,
  public.private_conversation_members,
  public.private_conversations,
  public.private_messages,
  public.release_tasks,
  public.rollout_events,
  public.taches,
  public.task_activity_logs,
  public.task_assignees,
  public.task_comments,
  public.task_files
from anon;

commit;
