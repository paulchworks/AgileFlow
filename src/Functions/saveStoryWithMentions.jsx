import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const currentUser = await base44.auth.me();
        if (!currentUser) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        
        const { storyId, data } = await req.json();
        let savedStory;
        
        if (storyId) {
            await base44.entities.Story.update(storyId, data);
            savedStory = { id: storyId, ...data };
        } else {
            savedStory = await base44.entities.Story.create(data);
        }

        const textToCheck = `${data.description || ''} ${data.user_story || ''}`;
        
        if (!textToCheck.includes('@')) {
            // No need to log if no mentions exist
        } else {
            const allUsers = await base44.entities.User.list();
            const notifiedUserIds = new Set();
            const escapeRegExp = (string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

            for (const user of allUsers) {
                if (notifiedUserIds.has(user.id)) {
                    continue;
                }

                let mentioned = false;
                
                if (user.full_name) {
                    const namePattern = `@${escapeRegExp(user.full_name)}\\b`;
                    const nameRegex = new RegExp(namePattern, 'i');
                    if (nameRegex.test(textToCheck)) {
                        mentioned = true;
                    }
                }
                
                if (!mentioned && user.email) {
                    const emailPattern = `@${escapeRegExp(user.email)}\\b`;
                    const emailRegex = new RegExp(emailPattern, 'i');
                    if (emailRegex.test(textToCheck)) {
                        mentioned = true;
                    }
                }

                if (mentioned) {
                    notifiedUserIds.add(user.id);
                    
                    try {
                        await base44.integrations.Core.SendEmail({
                            to: user.email,
                            subject: `You were mentioned in story: ${savedStory.title}`,
                            body: `
                                <p>Hi ${user.full_name || user.email},</p>
                                <p><strong>${currentUser.full_name}</strong> mentioned you in the story "<strong>${savedStory.title}</strong>".</p>
                                <hr>
                                <p><strong>User Story:</strong><br/>${data.user_story || 'No user story provided.'}</p>
                                ${data.description ? `<p><strong>Description:</strong><br/>${data.description.replace(/\n/g, '<br>')}</p>` : ''}
                                <hr>
                                <p>Log in to AgileFlow to view the full details.</p>
                                <p>Best regards,<br/>The AgileFlow Team</p>
                            `
                        });
                    } catch (emailError) {
                        console.error(`Failed to send notification to ${user.email}:`, emailError);
                    }
                }
            }
        }

        return new Response(JSON.stringify({ success: true, story: savedStory }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
        
    } catch (error) {
        console.error("Error in saveStoryWithMentions:", error);
        return new Response(JSON.stringify({ 
            error: 'Failed to save story', 
            details: error.message 
        }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});