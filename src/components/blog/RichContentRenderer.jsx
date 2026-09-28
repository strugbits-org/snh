import BlogRichButton from "./BlogRichButton";

// Origins that count as "this site", so a Wix button pointing at an absolute
// snhgolfcarts.com URL becomes an in-app route instead of a full page reload.
const SITE_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  "https://www.snhgolfcarts.com",
  "https://snhgolfcarts.com",
]
  .filter(Boolean)
  .map((value) => {
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  })
  .filter(Boolean);

// Turn a Ricos linkData/link object into { href, internal, target, rel }.
// Returns null when there is nothing to link to.
function resolveWixLink(link) {
  if (!link) return null;

  // In-page anchor rather than a URL.
  if (!link.url && link.anchor) {
    return { href: `#${link.anchor}`, internal: false };
  }

  const raw = (link.url || "").trim();
  if (!raw) return null;

  let href = raw;
  let internal = false;

  if (raw.startsWith("/")) {
    internal = true;
  } else if (/^(tel:|mailto:|#)/i.test(raw)) {
    internal = false;
  } else {
    try {
      const parsed = new URL(raw);
      if (SITE_ORIGINS.includes(parsed.origin)) {
        internal = true;
        href = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      // Not a parseable absolute URL — leave it exactly as the author wrote it.
    }
  }

  // Wix reports target as BLANK / SELF / PARENT / TOP, but older content can
  // already hold an HTML value like "_blank".
  const rawTarget = link.target || "";
  // A dialer or mail client opened in a new tab leaves an orphan blank tab —
  // and on desktop, where no tel: handler exists, the blank tab is all you get.
  // Editors tick "open in new tab" out of habit, so ignore it for these.
  const isHandoffScheme = /^(tel:|mailto:)/i.test(href);
  const newTab =
    !isHandoffScheme && (rawTarget === "BLANK" || rawTarget === "_blank");

  // link.rel is an object of booleans on newer content, a string on older.
  let rel;
  if (typeof link.rel === "string") {
    rel = link.rel;
  } else if (link.rel && typeof link.rel === "object") {
    rel =
      Object.entries(link.rel)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key.toLowerCase())
        .join(" ") || undefined;
  }

  if (newTab) {
    rel = [rel, "noopener", "noreferrer"]
      .filter(Boolean)
      .join(" ")
      .split(/\s+/)
      .filter((token, i, all) => all.indexOf(token) === i)
      .join(" ");
  }

  return {
    href,
    internal,
    target: newTab ? "_blank" : undefined,
    rel,
  };
}

const BUTTON_ALIGNMENT = {
  LEFT: "justify-start",
  CENTER: "justify-center",
  RIGHT: "justify-end",
};

function wixImageUrl(src) {
  if (!src) return null;
  if (typeof src === "string") {
    if (src.startsWith("wix:image://v1/")) {
      const mediaId = src.replace("wix:image://v1/", "").split("/")[0];
      return `https://static.wixstatic.com/media/${mediaId}`;
    }
    return src;
  }
  if (src.url) return src.url;
  if (src.id) return `https://static.wixstatic.com/media/${src.id}`;
  return null;
}

function renderDecorations(text, decorations = []) {
  if (!decorations || decorations.length === 0) return text;

  const bold = decorations.some((d) => d.type === "BOLD");
  const italic = decorations.some((d) => d.type === "ITALIC");
  const underline = decorations.some((d) => d.type === "UNDERLINE");
  const linkDec = decorations.find((d) => d.type === "LINK");

  let el = <>{text}</>;
  if (bold)
    el = <strong className="font-semibold text-foreground">{el}</strong>;
  if (italic) el = <em>{el}</em>;
  if (underline) el = <u>{el}</u>;
  if (linkDec?.linkData?.link?.url) {
    el = (
      <a
        href={linkDec.linkData.link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline hover:text-accent/80 transition-colors"
      >
        {el}
      </a>
    );
  }
  return el;
}

function renderInlineNodes(nodes) {
  if (!nodes || nodes.length === 0) return null;
  return nodes.map((child, i) => {
    if (child.type !== "TEXT") return null;
    const { text, decorations } = child.textData || {};
    if (text === undefined || text === null) return null;
    return <span key={i}>{renderDecorations(text, decorations)}</span>;
  });
}

function RenderNode({ node, idx, postSlug }) {
  if (!node) return null;

  switch (node.type) {
    case "PARAGRAPH": {
      const hasText = node.nodes && node.nodes.some((n) => n.textData?.text);
      if (!hasText) return null;
      return (
        <p key={idx} className="text-base leading-7 text-muted-foreground mb-3">
          {renderInlineNodes(node.nodes)}
        </p>
      );
    }

    case "HEADING": {
      const level = node.headingData?.level || 2;
      const classes = {
        1: "font-display font-bold text-3xl text-foreground mt-8 mb-3",
        2: "font-display font-bold text-2xl text-foreground mt-7 mb-2",
        3: "font-display font-bold text-xl text-foreground mt-6 mb-2",
        4: "font-display font-semibold text-lg text-foreground mt-5 mb-1",
        5: "font-display font-semibold text-base text-foreground mt-4 mb-1",
        6: "font-display font-semibold text-sm text-foreground mt-3 mb-1",
      };
      const Tag = `h${level}`;
      return (
        <Tag key={idx} className={classes[level] || classes[2]}>
          {renderInlineNodes(node.nodes)}
        </Tag>
      );
    }

    case "IMAGE": {
      const { image } = node.imageData || {};
      if (!image?.src) return null;
      const url = wixImageUrl(image.src);
      if (!url) return null;
      const altText = image.altText || "";
      const caption = node.imageData?.caption;

      const w = image.width;
      const h = image.height;
      const aspectStyle = w && h ? { aspectRatio: `${w} / ${h}` } : {};
      return (
        <figure key={idx} className="my-6">
          <img
            src={url}
            alt={altText}
            style={aspectStyle}
            className="w-full rounded-xl object-cover shadow-sm"
            loading="lazy"
          />
          {caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "BULLETED_LIST": {
      return (
        <ul key={idx} className="list-disc list-outside ml-5 mb-3 space-y-1">
          {(node.nodes || []).map((item, i) => (
            <RenderListItem key={i} node={item} postSlug={postSlug} />
          ))}
        </ul>
      );
    }

    case "ORDERED_LIST": {
      const start = node.orderedListData?.start;
      return (
        <ol key={idx} start={start} className="list-decimal list-outside ml-5 mb-3 space-y-1">
          {(node.nodes || []).map((item, i) => (
            <RenderListItem key={i} node={item} postSlug={postSlug} />
          ))}
        </ol>
      );
    }

    case "BLOCKQUOTE": {
      return (
        <blockquote
          key={idx}
          className="border-l-4 border-accent/50 pl-5 my-5 italic text-muted-foreground"
        >
          {(node.nodes || []).map((child, i) => (
            <RenderNode key={i} node={child} idx={i} postSlug={postSlug} />
          ))}
        </blockquote>
      );
    }

    case "DIVIDER": {
      return <hr key={idx} className="my-6 border-border" />;
    }

    // A button placed in the Wix blog editor. Styled to the site rather than to
    // buttonData.styles, the same way headings and tables above ignore Wix's
    // own styling and use ours.
    case "BUTTON": {
      const data = node.buttonData || {};
      const text = (data.text || "").trim();
      const resolved = resolveWixLink(data.link);

      // Every button the author places is rendered, linked or not. A button
      // with no URL yet still shows up so it's visible in the article rather
      // than silently disappearing — it just isn't clickable until a link is
      // set in Wix. Only a button with no label at all has nothing to draw.
      if (!text) {
        console.warn(
          `RichContentRenderer: skipping BUTTON node ${node.id || idx} — no text.`,
        );
        return null;
      }

      if (!resolved) {
        console.warn(
          `RichContentRenderer: BUTTON node ${node.id || idx} ("${text}") has ` +
            `no link URL set in Wix — rendering it unlinked.`,
        );
      }

      const align =
        BUTTON_ALIGNMENT[data.containerData?.alignment] || "justify-start";

      return (
        <div key={idx} className={`my-8 flex ${align}`}>
          <BlogRichButton
            text={text}
            href={resolved?.href}
            internal={resolved?.internal}
            target={resolved?.target}
            rel={resolved?.rel}
            postSlug={postSlug}
          />
        </div>
      );
    }

    case "CODE_BLOCK": {
      const text = (node.nodes || [])
        .flatMap((n) => n.nodes || [n])
        .map((n) => n.textData?.text || "")
        .join("");
      return (
        <pre
          key={idx}
          className="bg-muted rounded-xl p-4 my-5 overflow-x-auto text-sm font-mono text-foreground"
        >
          <code>{text}</code>
        </pre>
      );
    }

    case "TABLE": {
      return (
        <div key={idx} className="overflow-x-auto my-8 rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <tbody className="divide-y divide-border">
              {(node.nodes || []).map((row, i) => (
                <RenderNode key={i} node={row} idx={i} postSlug={postSlug} />
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "TABLE_ROW": {
      return (
        <tr key={idx} className="divide-x divide-border">
          {(node.nodes || []).map((cell, i) => (
            <RenderNode key={i} node={cell} idx={i} postSlug={postSlug} />
          ))}
        </tr>
      );
    }

    case "TABLE_CELL": {
      return (
        <td key={idx} className="p-4 align-top">
          {(node.nodes || []).map((child, i) => (
            <RenderNode key={i} node={child} idx={i} postSlug={postSlug} />
          ))}
        </td>
      );
    }

    default:
      return null;
  }
}

function RenderListItem({ node, postSlug }) {
  return (
    <li className="text-base leading-7 text-muted-foreground">
      {(node.nodes || []).map((child, i) => {
        if (child.type === "PARAGRAPH") {
          return <span key={i}>{renderInlineNodes(child.nodes)}</span>;
        }
        return <RenderNode key={i} node={child} idx={i} postSlug={postSlug} />;
      })}
    </li>
  );
}

export default function RichContentRenderer({ richContent, postSlug }) {
  if (!richContent?.nodes || richContent.nodes.length === 0) return null;

  return (
    <div className="rich-content">
      {richContent.nodes.map((node, i) => (
        <RenderNode key={node.id || i} node={node} idx={i} postSlug={postSlug} />
      ))}
    </div>
  );
}
