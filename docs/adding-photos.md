# Adding photos to the site (no coding required)

This guide is for adding a photo to the SturdiHome website using an AI coding
assistant to do the actual code changes for you. You don't need to know how to
code. You just need to be able to find a file on your computer and type
sentences.

It assumes you're working inside this project with an AI assistant that can read
and edit files (for example, Claude Code in VS Code, which is what built this
site). If you're using a different assistant, the steps are the same; only the
exact way you "open a chat with it" will differ.

## Step 1: Get your photo ready

- Use a `.jpg`, `.jpeg`, `.png`, or `.webp` file.
- Keep the file size small, ideally under 2 MB. Large photos make the site slow
  to load. If your photo is huge (many phone photos are 5-10 MB), ask your AI
  assistant to resize it for you in Step 3, or use a free tool like
  [squoosh.app](https://squoosh.app) first.
- Rename the file to something simple and descriptive, using only lowercase
  letters, numbers, and hyphens. No spaces.
  - Good: `homeowner-hero.jpg`, `team-photo.jpg`
  - Avoid: `IMG_4821 (2).JPG`, `My Photo!.png`
- Make sure you have the right to use the photo (it's yours, it's licensed for
  this use, or it's from a royalty-free source).

## Step 2: Add the photo file to the project

1. In your file explorer (or the file sidebar in VS Code), open this project's
   `public` folder.
2. If there isn't one already, create a folder inside `public` called `images`.
3. Drag your photo file into `public/images`. That's it. No code involved yet.

Your file should now exist at a path like `public/images/homeowner-hero.jpg`.

## Step 3: Ask your AI assistant to put it on the page

Open a chat with your AI assistant and describe what you want in plain English.
Be specific about which page and roughly where. A few examples you can copy and
adjust:

> "I added a photo at public/images/homeowner-hero.jpg. Please add it as a
> banner image near the top of the homepage, above the 'Home improvements, made
> sturdier' heading."

> "I added public/images/team-photo.jpg. Please add it to the About section
> of the homepage, with some reasonable sizing so it doesn't look huge or
> tiny."

> "The photo I added at public/images/homeowner-hero.jpg is 8 MB and pretty
> large. Can you resize/compress it and make sure the page still loads fast?"

The assistant will make the code changes for you (typically using Next.js's
`Image` component, which is the standard, performance-friendly way to show
images in this kind of project). You don't need to review the code itself,
just the result.

## Step 4: Check that it looks right

Ask the assistant to start the local preview and show you, or describe, what
changed:

> "Can you start the dev server and confirm the photo shows up correctly?"

If you have the project running locally, open http://localhost:3000 in your
browser and look at the page.

## Step 5: Publish the change

Once you're happy with how it looks, ask the assistant to save and publish it:

> "That looks good. Please commit this change and push it so it goes live."

Pushing to GitHub automatically deploys the update to the live site at
https://sturdihome.vercel.app within a minute or two. Refresh the live site to
confirm your photo is there.

## Troubleshooting

- **Photo doesn't show up at all:** double-check the file actually saved into
  `public/images` and that the filename you told the assistant matches exactly
  (including the file extension, like `.jpg` vs `.png`).
- **Photo looks stretched or squished:** tell the assistant, e.g. "the photo
  looks stretched, please fix the aspect ratio."
- **Page loads slowly after adding the photo:** tell the assistant the photo
  feels slow to load and ask it to compress or resize it.
- **You don't see your change on the live site:** confirm with the assistant
  that the change was actually pushed to GitHub (ask "did you push this?"),
  then give it a minute or two for Vercel to finish deploying.
