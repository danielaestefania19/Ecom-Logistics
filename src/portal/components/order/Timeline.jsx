import { useT } from "../../i18n";
import { StageBadge } from "../ui";

const NOTE_KEYS = new Set(["order_submitted", "carrier_delivered"]);

const Timeline = ({ events, userId, names }) => {
  const { t, fmtDateTime } = useT();

  const who = (actorId) => {
    if (!actorId) return t("timeline.system");
    if (actorId === userId) return t("timeline.you");
    return names?.[actorId] || t("timeline.team");
  };

  if (!events.length) return <p className="text-sm text-gray-400">{t("timeline.empty")}</p>;

  return (
    <ol className="relative border-l border-gray-200 ml-2 space-y-5">
      {[...events].reverse().map((ev) => (
        <li key={ev.id} className="ml-5">
          <span className={`absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full ${ev.visible_to_client ? "bg-third" : "bg-amber-400"}`} />
          <div className="flex flex-wrap items-center gap-2">
            {ev.to_stage && <StageBadge stage={ev.to_stage} />}
            {!ev.visible_to_client && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {t("timeline.internal")}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {fmtDateTime(ev.created_at)} · {who(ev.actor_id)}
            </span>
          </div>
          {ev.note && (
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
              {NOTE_KEYS.has(ev.note) ? t(`timeline.notes.${ev.note}`) : ev.note}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
};

export default Timeline;
