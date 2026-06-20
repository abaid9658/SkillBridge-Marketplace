// AI generator controller utilizing rich templates for immediate, secure, zero-dependency replies.
const User = require('../models/User');

exports.generateServiceContent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.subscriptionTier === 'free') {
      return res.status(403).json({
        success: false,
        message: 'AI Copilot features are restricted. Please upgrade to a Pro or Agency subscription to unlock.'
      });
    }

    const { category, keywords, title } = req.body;
    if (!category || !keywords) {
      return res.status(400).json({ success: false, message: 'Please provide category and keywords.' });
    }

    const keyList = keywords.split(',').map(k => k.trim()).filter(Boolean);
    const mainKeyword = keyList[0] || 'high-quality service';

    // Formulate a beautiful template-based description
    const generatedTitle = title || `I will provide professional ${category} focusing on ${mainKeyword}`;
    const generatedDescription = `### Welcome to my Professional ${category} Gig!
    
Are you looking to scale your business, launch a new product, or design a stunning interface? You are in the right place!

I am an experienced developer and designer specializing in **${category}**. By focusing on modern aesthetics, solid architecture, and high performance, I ensure that your vision translates perfectly into reality.

#### What you will receive:
- **Premium Quality:** Fully customized solution tailored specifically to your branding and business goals.
- **Clean Architecture:** Standard, maintainable setup designed for growth.
- **Full Support:** 30 days of post-delivery support to ensure smooth onboarding.
- **Fast Delivery:** Complete timeline transparently tracked via milestones.

#### Key Focus Areas & Technologies:
${keyList.map(k => `- **${k}:** Advanced integration and best practices applied.`).join('\n')}

#### Why Choose Me?
1. Vetted provider with a track record of successful deliveries on SkillBridge.
2. Rapid and transparent communication (updates sent every 24 hours).
3. 100% satisfaction guarantee or revisions until it is perfect.

Let's collaborate to build something exceptional. Place your order now or contact me to discuss custom requirements!`;

    const generatedTags = [...new Set([category.toLowerCase().split(' ')[0], ...keyList.slice(0, 4).map(k => k.toLowerCase())])];

    const generatedFaqs = [
      { q: `What is the typical timeline for this ${category} project?`, a: 'Most standard requests are completed in 3 to 7 days, depending on scope complexity.' },
      { q: 'Do you offer post-project support?', a: 'Yes! All packages include 30 days of free support for any technical questions or bug fixes.' },
      { q: 'Can I request a custom package order?', a: 'Absolutely. Contact me directly via Chat and I will create a tailored proposal for your budget.' }
    ];

    res.json({
      success: true,
      data: {
        title: generatedTitle,
        description: generatedDescription,
        tags: generatedTags.join(', '),
        faqs: generatedFaqs
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.generateProposalContent = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.subscriptionTier === 'free') {
      return res.status(403).json({
        success: false,
        message: 'AI Copilot features are restricted. Please upgrade to a Pro or Agency subscription to unlock.'
      });
    }

    const { jobTitle, jobDescription, skills } = req.body;
    if (!jobTitle) {
      return res.status(400).json({ success: false, message: 'Please provide job details.' });
    }

    const skillsList = skills ? (Array.isArray(skills) ? skills : skills.split(',')) : [];
    const skillsString = skillsList.slice(0, 3).join(', ') || 'required skills';

    const generatedCoverLetter = `Dear Client,

I read your project description for "${jobTitle}" with great interest, and I am confident that I can deliver outstanding results for this role.

Having worked extensively on projects requiring ${skillsString}, I possess the technical skills and workflow efficiency to execute this task successfully. I focus on writing clean, scalable code and delivering premium visual designs that align perfectly with client standards.

Here is how I plan to approach your project:
1. **Requirement Alignment:** Initial sync to clarify details and map out key milestones.
2. **Prototype/Draft Review:** Send early progress reports to ensure the design matches your exact requirements.
3. **Execution & Polish:** Solid development/design incorporating responsive details and animations where necessary.
4. **Final Handoff:** Clean delivery with walkthrough comments.

I am available to start immediately and can adjust my schedule to meet your target deadline. Let's start a chat conversation to align on the technical specs and budget details.

Thank you for your consideration, and I look forward to working with you!

Best regards,
SkillBridge Service Provider`;

    res.json({
      success: true,
      data: {
        coverLetter: generatedCoverLetter
      }
    });
  } catch (err) {
    next(err);
  }
};
