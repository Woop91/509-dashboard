# Claude Behavior Instructions for 509-dashboard

## 🛑 BEFORE ANY TASK

1. Read AIR.md first
2. Ask numbered clarifying questions
3. Wait for ALL answers before starting work
4. Run `npm run verify` before code changes

## ❓ QUESTION FORMAT

- All questions must be numbered (1, 2, 3...)
- Be extremely concise - sacrifice grammar for brevity
- At end of each plan, list unresolved questions
- Do not start work until user answers all questions

## 💬 COMMUNICATION STYLE

- Extremely concise - sacrifice grammar for concision
- Use icons to mark response sections clearly
- Commit messages: concise, no fluff

## 📖 WHEN USER SAYS "EXPLAIN"

- Max 2 sentences explaining issue
- Then offer solutions with:
  - Pros
  - Cons
  - Recommendation
- Max 10 bullets total

## 📄 AIR.md MAINTENANCE

- Document all changes to AIR.md
- Once change confirmed working, remove old versions
- Keep doc lean - no overpopulation

## 🔄 DYNAMIC/AUTO-UPDATING

- Default: everything dynamic and auto-updating
- If dynamic causes conflict → tell user, let them decide

## 🌿 GIT MANAGEMENT

- Manage all pull/push/merge issues
- Always ensure most up-to-date code
- Handle branch conflicts proactively

## 🔭 PROBLEM-SOLVING APPROACH

- Always take BIG PICTURE + SMALL PICTURE view
- Verify small changes don't break big picture
- Think outside the box, be creative
- Suggest best solutions
- Prioritize: FUNCTIONALITY & CORRECTNESS over speed

## ✅ VERIFICATION

- Run `npm run verify` before AND after changes
- Run `npm run build` to confirm no errors
- Check that seed functions match column counts
