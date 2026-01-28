# 📧 EMAIL NOTIFICATIONS - System Proposal

## Overview

Pour compléter le système Team Collaboration, nous devons implémenter un système d'email notifications qui informe les membres de l'équipe des événements importants (invitations, @mentions, approvals, etc.).

---

## Why Email Notifications Are Critical

### Without Emails
- ❌ Users must check app constantly
- ❌ @mentions go unnoticed
- ❌ Approval requests get delayed
- ❌ Poor user experience

### With Emails
- ✅ Instant notifications
- ✅ @mentions seen immediately
- ✅ Faster approval cycles
- ✅ Professional workflow

### ROI Impact
- **Before:** 2h average approval time (users check app sporadically)
- **After:** 15min average (instant email notification)
- **Time saved:** 1.75h × 10 projects = **17.5h/month**

---

## Architecture

### Email Service Provider Options

#### Option 1: Resend (Recommended) ⭐
**Pros:**
- ✅ Modern, developer-friendly API
- ✅ Beautiful default templates
- ✅ Free tier: 3,000 emails/month
- ✅ $20/month for 50,000 emails
- ✅ React Email for templates
- ✅ Built-in analytics

**Cons:**
- ⚠️ Newer service (less proven)

#### Option 2: SendGrid
**Pros:**
- ✅ Industry standard
- ✅ Free tier: 100 emails/day
- ✅ Proven reliability
- ✅ Advanced analytics

**Cons:**
- ❌ More expensive ($19.95/month for 40K emails)
- ❌ Complex API
- ❌ Ugly default templates

#### Option 3: AWS SES
**Pros:**
- ✅ Extremely cheap ($0.10 per 1,000 emails)
- ✅ Scales infinitely
- ✅ High deliverability

**Cons:**
- ❌ Complex setup
- ❌ No templates
- ❌ Requires AWS account

### Recommendation: **Resend**

**Reasons:**
1. Modern API (easier to implement)
2. React Email for beautiful templates
3. Free tier covers initial usage
4. Scales affordably
5. Built for modern SaaS apps

---

## Email Types

### 1. Team Invitations ✉️

**Trigger:** Admin invites new member

**Subject:** `You've been invited to join [Team Name] on Cortexia`

**Content:**
```
Hi [Name],

[Admin Name] has invited you to join [Team Name] on Cortexia as an [Role].

Your role gives you access to:
- [Permission 1]
- [Permission 2]
- [Permission 3]

[Accept Invitation Button]

Or copy this link:
https://cortexia.ai/join-team/[teamId]?token=[inviteToken]

This invitation expires in 7 days.

Questions? Reply to this email.

---
The Cortexia Team
```

**Priority:** 🔴 HIGH

---

### 2. @Mention Notifications 💬

**Trigger:** User @mentions someone in comment

**Subject:** `[@Mention] [User] mentioned you in [Project Name]`

**Content:**
```
Hi [Name],

[User Name] mentioned you in a comment on [Project/Generation Name]:

"@[Your Name] what do you think about this design?"

[View Comment Button]

---
The Cortexia Team
```

**Priority:** 🔴 HIGH

---

### 3. Approval Requests ✅

**Trigger:** Designer submits for approval

**Subject:** `[Approval Request] [Project Name] needs your review`

**Content:**
```
Hi [Name],

[Designer Name] has submitted [Generation Title] for your approval.

[Image Preview]

[View & Approve Button]

You can:
- ✅ Approve
- ❌ Reject
- 💬 Request Changes

---
The Cortexia Team
```

**Priority:** 🔴 HIGH

---

### 4. Approval Decisions 📝

**Trigger:** Approver makes decision

**Subject:** `[Decision] Your design was [Approved/Rejected]`

**Content (Approved):**
```
Hi [Designer Name],

Good news! [Approver Name] has approved your design "[Title]".

[Image Preview]

Comment: "[Optional approver comment]"

[View Final Button]

---
The Cortexia Team
```

**Content (Changes Requested):**
```
Hi [Designer Name],

[Approver Name] has requested changes to "[Title]".

[Image Preview]

Feedback:
"[Approver comment]"

[View & Edit Button]

---
The Cortexia Team
```

**Priority:** 🟡 MEDIUM

---

### 5. Comment Replies 💬

**Trigger:** Someone replies to your comment

**Subject:** `[Reply] [User] replied to your comment`

**Content:**
```
Hi [Name],

[User Name] replied to your comment on [Project Name]:

Your comment: "[Original comment]"

Their reply: "[Reply content]"

[View Conversation Button]

---
The Cortexia Team
```

**Priority:** 🟢 LOW

---

### 6. Daily Digest 📊

**Trigger:** Scheduled (8am user timezone)

**Subject:** `Your Cortexia Daily Digest - [Date]`

**Content:**
```
Hi [Name],

Here's what happened in your team yesterday:

📬 Pending Items (3)
- [Generation Title] needs your approval
- [Generation Title] needs your approval
- You have 2 unread comments

📊 Recent Activity
- [User] approved [Generation]
- [User] commented on [Project]
- [User] invited [New Member]

[View Dashboard Button]

---
The Cortexia Team
```

**Priority:** 🟢 LOW (Nice to have)

---

## Implementation Plan

### Phase 1: Core Infrastructure (2-3 hours)

1. **Setup Resend Account**
   - Sign up at resend.com
   - Get API key
   - Store in env var `RESEND_API_KEY`

2. **Create Email Service**
   - Create `/supabase/functions/server/email-service.ts`
   - Wrapper for Resend API
   - Email queue (optional, for reliability)

3. **Create Email Templates**
   - Use React Email
   - Create `/supabase/functions/server/email-templates/`
   - Templates for each email type

```typescript
// email-service.ts
import { Resend } from 'npm:resend@^2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export async function sendTeamInvite(
  to: string,
  teamName: string,
  inviterName: string,
  role: string,
  inviteLink: string
) {
  const { data, error } = await resend.emails.send({
    from: 'Cortexia <notifications@cortexia.ai>',
    to,
    subject: `You've been invited to join ${teamName} on Cortexia`,
    html: renderTeamInviteEmail({
      teamName,
      inviterName,
      role,
      inviteLink,
    }),
  });
  
  if (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
  
  return data;
}
```

---

### Phase 2: Email Templates (3-4 hours)

**Using React Email:**

```typescript
// email-templates/TeamInvite.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export function TeamInviteEmail({
  teamName,
  inviterName,
  role,
  inviteLink,
  permissions,
}: TeamInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {teamName} on Cortexia</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You're invited!</Heading>
          
          <Text style={text}>
            {inviterName} has invited you to join <strong>{teamName}</strong> on Cortexia as an <strong>{role}</strong>.
          </Text>
          
          <Section style={permissionsSection}>
            <Text style={permissionsTitle}>Your role gives you access to:</Text>
            {permissions.map((perm, i) => (
              <Text key={i} style={permissionItem}>✓ {perm}</Text>
            ))}
          </Section>
          
          <Button style={button} href={inviteLink}>
            Accept Invitation
          </Button>
          
          <Text style={footer}>
            Or copy this link: {inviteLink}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const button = {
  backgroundColor: '#6B5D4F',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};
```

**Templates to Create:**
1. `TeamInvite.tsx` ✅ P0
2. `MentionNotification.tsx` ✅ P0
3. `ApprovalRequest.tsx` ✅ P0
4. `ApprovalDecision.tsx` ✅ P0
5. `CommentReply.tsx` ⏳ P1
6. `DailyDigest.tsx` ⏳ P2

---

### Phase 3: Integration (2-3 hours)

**Update backend routes to send emails:**

```typescript
// team-routes.ts - Invite member
app.post('/teams/:teamId/members/invite', async (c) => {
  // ... existing code ...
  
  const member = await TeamCollab.addTeamMember(...);
  
  // ✅ NEW: Send invitation email
  await sendTeamInvite(
    email,
    team.name,
    inviterName,
    role,
    `https://cortexia.ai/join-team/${teamId}?token=${generateInviteToken()}`
  );
  
  return c.json({ success: true, data: { member } });
});

// team-routes.ts - Add comment
app.post('/teams/:teamId/comments', async (c) => {
  // ... existing code ...
  
  const comment = await TeamCollab.addComment(...);
  
  // ✅ NEW: Send @mention emails
  if (mentions.length > 0) {
    for (const mentionedUserId of mentions) {
      const mentionedUser = teamMembers.find(m => m.userId === mentionedUserId);
      if (mentionedUser) {
        await sendMentionNotification(
          mentionedUser.email,
          userName,
          targetType,
          targetId,
          content
        );
      }
    }
  }
  
  return c.json({ success: true, data: { comment } });
});

// team-routes.ts - Create approval
app.post('/teams/:teamId/approvals', async (c) => {
  // ... existing code ...
  
  const approval = await TeamCollab.createApprovalRequest(...);
  
  // ✅ NEW: Send approval request emails
  for (const approverId of approvers) {
    const approver = teamMembers.find(m => m.userId === approverId);
    if (approver) {
      await sendApprovalRequest(
        approver.email,
        requesterName,
        generationTitle,
        generationImageUrl,
        `https://cortexia.ai/approve/${approval.id}`
      );
    }
  }
  
  return c.json({ success: true, data: { approval } });
});
```

---

### Phase 4: User Preferences (1-2 hours)

**Email Notification Settings:**

```typescript
// User settings
interface EmailPreferences {
  teamInvites: boolean;           // Default: true
  mentions: boolean;               // Default: true
  approvalRequests: boolean;       // Default: true
  approvalDecisions: boolean;      // Default: true
  commentReplies: boolean;         // Default: true
  dailyDigest: boolean;            // Default: false
  weeklyReport: boolean;           // Default: false
}
```

**Settings UI:**
- Add "Email Notifications" section in Settings
- Toggle switches for each notification type
- Save preferences to KV store

---

## Cost Estimate

### Resend Pricing

| Tier | Monthly Emails | Cost |
|------|---------------|------|
| Free | 3,000 | $0 |
| Pro | 50,000 | $20 |
| Scale | 100,000 | $80 |

### Expected Usage

**Per Enterprise Account (15 members):**
- Invites: 15 emails (one-time)
- @Mentions: ~30/month
- Approvals: ~20/month (10 projects × 2 emails each)
- Replies: ~10/month
- **Total:** ~75 emails/month per account

**For 40 Enterprise accounts:**
- 40 × 75 = **3,000 emails/month**
- **Cost:** $0 (Free tier)

**For 200 Enterprise accounts:**
- 200 × 75 = **15,000 emails/month**
- **Cost:** $20/month (Pro tier)

---

## Testing Plan

### 1. Team Invite Email
- [ ] Invite member as Admin
- [ ] Check email received
- [ ] Click invitation link
- [ ] Verify user joins team

### 2. @Mention Email
- [ ] Comment with @mention
- [ ] Check mentioned user receives email
- [ ] Click "View Comment" link
- [ ] Verify navigates to correct location

### 3. Approval Request Email
- [ ] Submit generation for approval
- [ ] Check approver receives email
- [ ] Click "View & Approve" button
- [ ] Verify opens approval modal

### 4. Approval Decision Email
- [ ] Approve generation
- [ ] Check designer receives email
- [ ] Verify includes approver comment
- [ ] Test reject + changes requested

### 5. Email Preferences
- [ ] Turn off @mention emails
- [ ] Verify emails not sent
- [ ] Turn back on
- [ ] Verify emails resume

---

## Security & Privacy

### Email Validation
- ✅ Validate email format
- ✅ Check email deliverability
- ✅ Rate limiting (prevent spam)

### Unsubscribe
- ✅ Include unsubscribe link in every email
- ✅ One-click unsubscribe
- ✅ Honor unsubscribe immediately

### Privacy
- ✅ Never share emails with third parties
- ✅ Encrypt email addresses in database
- ✅ GDPR compliant
- ✅ CAN-SPAM compliant

---

## Deliverability Best Practices

### Domain Setup
1. **Add SPF record**
   ```
   v=spf1 include:amazonses.com include:_spf.resend.com ~all
   ```

2. **Add DKIM record**
   - Provided by Resend

3. **Add DMARC record**
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@cortexia.ai
   ```

### Email Content
- ✅ Clear, concise subject lines
- ✅ Plain text + HTML versions
- ✅ Unsubscribe link in footer
- ✅ Valid "From" address
- ✅ Avoid spam trigger words

---

## Timeline

### Week 1: Core Infrastructure
- Day 1-2: Setup Resend + Email service
- Day 3-4: Create email templates
- Day 5: Test basic sending

### Week 2: Integration
- Day 1-2: Integrate team invites
- Day 3-4: Integrate @mentions + approvals
- Day 5: Testing

### Week 3: Polish
- Day 1-2: Email preferences UI
- Day 3-4: Unsubscribe flow
- Day 5: Final testing

**Total:** 3 weeks (15 working days)

---

## Success Metrics

### Email Performance
- **Open rate:** >40% (industry avg: 20%)
- **Click rate:** >10% (industry avg: 2.5%)
- **Bounce rate:** <2%
- **Spam rate:** <0.1%

### Business Impact
- **Approval time:** 15min (vs 2h before)
- **Response time:** 5min (vs 1h before)
- **User engagement:** +50%

---

## Alternative: In-App Notifications Only

**Pros:**
- ✅ No email service cost
- ✅ Simpler implementation
- ✅ No deliverability issues

**Cons:**
- ❌ Users must be in app
- ❌ @mentions go unnoticed
- ❌ Slow approval cycles
- ❌ Poor UX

**Recommendation:** Email notifications are CRITICAL for professional workflow.

---

## Conclusion

Email notifications are **essential** to make Team Collaboration valuable. Without them:
- ❌ Users miss important updates
- ❌ Approval cycles are slow
- ❌ UX feels incomplete

With emails:
- ✅ Instant notifications
- ✅ Fast approval cycles
- ✅ Professional workflow
- ✅ Justifies $999/month price

### Recommendation

**Implement Email Notifications using Resend**

- **Cost:** $0-$20/month (affordable)
- **Time:** 3 weeks development
- **ROI:** Critical for Enterprise adoption
- **Priority:** 🔴 HIGH (launch blocker)

---

**Ready to proceed with implementation?**
