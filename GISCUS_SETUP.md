# Giscus Comment System Setup

## What is Giscus?

Giscus is a comment system powered by GitHub Discussions. It's:
- ✅ Open source and free
- ✅ No ads or tracking
- ✅ GitHub-themed
- ✅ Markdown support
- ✅ Automatic dark/light mode switching
- ✅ Moderation via GitHub

## Setup Steps

### 1. Enable GitHub Discussions

1. Go to your repository on GitHub: `https://github.com/lscaturchio/lscaturchio.xyz`
2. Click **Settings** tab
3. Scroll down to **Features** section
4. Check **Discussions**

### 2. Get Your Configuration Values

1. Visit https://giscus.app
2. Enter your repository: `lscaturchio/lscaturchio.xyz`
3. Select Discussion Category (recommended: "Blog Comments" or "Announcements")
4. Choose mapping: **pathname** (recommended)
5. The app will generate your configuration:
   - `data-repo-id`
   - `data-category-id`

### 3. Update the Component

Replace the placeholder values in `src/components/blog/giscus-comments.tsx`:

```typescript
export function GiscusComments({
  repo = "lscaturchio/lscaturchio.xyz",
  repoId = "YOUR_REPO_ID",        // ← Replace this
  category = "Blog Comments",
  categoryId = "YOUR_CATEGORY_ID", // ← Replace this
}: GiscusCommentsProps) {
```

### 4. Enable Comments in BlogLayout

The component is already integrated but commented out. To enable:

In `src/components/blog/BlogLayout.tsx`, uncomment the GiscusComments component:

```tsx
// Currently:
{/* <CommentSection /> */}

// Change to:
<GiscusComments />
```

Don't forget to import it:

```tsx
import { GiscusComments } from './giscus-comments'
```

### 5. Create a Discussions Category (Optional but Recommended)

1. Go to **Discussions** tab in your repo
2. Click **Categories** (gear icon)
3. Create a new category: "Blog Comments"
4. Choose format: **Announcement** (only maintainers can create, anyone can comment)
5. Copy the category ID from giscus.app

## Configuration Options

### Mapping Methods

- **pathname** (recommended): Each page URL gets its own discussion
- **url**: Same as pathname but includes domain
- **title**: Maps by page title
- **og:title**: Maps by Open Graph title

### Theme Sync

The component automatically syncs with your site's dark/light mode using `useTheme()` from `next-themes`.

## Features

- 💬 GitHub-based authentication (no separate signup)
- 🎨 Automatic theme switching
- 📝 Markdown and code syntax highlighting
- 👍 Reactions and upvotes
- 🔔 GitHub notifications for replies
- 🛡️ Built-in spam protection

## Moderation

- Comments are GitHub Discussions
- You can moderate from GitHub Discussions UI
- Lock, hide, delete, or edit comments
- Ban users via GitHub repository settings

## Privacy

- No cookies (except GitHub session)
- No analytics
- No third-party trackers
- Data stored in GitHub Discussions

## Testing

1. Run your site locally: `npm run dev`
2. Navigate to a blog post
3. You should see "Sign in with GitHub" prompt
4. Comment and verify it appears in GitHub Discussions

## Troubleshooting

**Comments not loading?**
- Check repo is public
- Verify Discussions are enabled
- Confirm repo-id and category-id are correct
- Check browser console for errors

**Theme not switching?**
- Ensure `useTheme` is properly configured
- Check if iframe is loaded before theme change

**No sign in button?**
- Verify giscus.app script loaded (check Network tab)
- Check for CSP errors in console

## Alternative: Manual GitHub Discussion Links

If you prefer not to embed, you can add a "Discuss on GitHub" link:

```tsx
<Link
  href={`https://github.com/lscaturchio/lscaturchio.xyz/discussions`}
  target="_blank"
  className="text-primary hover:underline"
>
  💬 Discuss this post on GitHub
</Link>
```

---

Last Updated: 2025-01-18
