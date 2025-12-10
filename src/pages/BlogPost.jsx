import React, { useEffect, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, Facebook, Twitter, Linkedin } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Scroll to top when component mounts or id changes
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  // Sample blog posts data (in a real app, this would come from an API)
  const blogPosts = {
    1: {
      id: 1,
      title: "Understanding the New Legal Framework",
      content: `
        <p>The Indian legal system has undergone significant transformations in recent years. This comprehensive guide explores the latest amendments, their implications, and how legal professionals can adapt to these changes effectively.</p>
        
        <h2>Recent Legislative Changes</h2>
        <p>Explore the latest changes in Indian legal system and how they impact modern legal practice. The legal landscape in India has been evolving rapidly with new legislation, amendments to existing laws, and important judicial decisions that reshape how legal professionals operate.</p>
        
        <p>Recent amendments have introduced new provisions across various areas of law, including criminal law reforms, commercial law updates, and procedural changes. Understanding these changes is crucial for legal professionals who need to stay current with the law.</p>
        
        <h2>Impact on Modern Legal Practice</h2>
        <p>These changes have far-reaching implications for legal professionals. Learn about recent amendments and their implications for legal professionals working in various practice areas. The new legal framework affects:</p>
        <ul>
          <li><strong>Case Preparation:</strong> New procedures and requirements for filing and presenting cases</li>
          <li><strong>Client Advisory:</strong> Updated legal advice based on new legislation</li>
          <li><strong>Compliance:</strong> New regulatory requirements and compliance obligations</li>
          <li><strong>Legal Research:</strong> Updated databases and resources reflecting new laws</li>
        </ul>
        
        <h2>Adapting to Change</h2>
        <p>Legal professionals must adapt to these changes to remain effective and compliant. This involves continuous learning, staying updated with legal developments, and leveraging modern tools and platforms that help navigate the evolving legal landscape.</p>
        
        <p>Platforms like Salhakar provide comprehensive access to updated legal information, making it easier for legal professionals to stay current with the latest changes in the legal framework.</p>
      `,
      author: "Dr. Priya Sharma",
      date: "2024-12-15",
      readTime: "8 min read",
      category: "Legal Updates",
      image: "/logo4.png",
      tags: ["Legal Updates", "Legislation", "Legal Framework"]
    },
    2: {
      id: 2,
      title: "AI-Powered Legal Research",
      content: `
        <p>Artificial intelligence is reshaping the legal industry. From automated case research to predictive analytics, AI tools are helping legal professionals work more efficiently and make better-informed decisions.</p>
        
        <h2>Discover How AI is Revolutionizing Legal Research</h2>
        <p>Discover how artificial intelligence is revolutionizing legal research and case analysis. Modern AI-powered platforms can analyze vast amounts of legal data in seconds, providing accurate, relevant results that would have taken hours or even days to find manually.</p>
        
        <p>AI technology uses advanced natural language processing to understand complex legal queries. Whether you're searching for specific case law, legal precedents, or statutory provisions, AI systems can interpret your question and provide precise answers.</p>
        
        <h2>Transforming the Way Lawyers Work</h2>
        <p>See how modern tools are transforming the way lawyers work. AI-powered legal research offers several key advantages:</p>
        <ul>
          <li><strong>Speed and Efficiency:</strong> Research that once took hours can now be completed in minutes</li>
          <li><strong>Accuracy:</strong> AI reduces human error and ensures comprehensive coverage</li>
          <li><strong>Predictive Analytics:</strong> AI can predict case outcomes and identify relevant precedents</li>
          <li><strong>Cost Reduction:</strong> Reduce research costs while improving outcomes</li>
        </ul>
        
        <h2>Case Analysis and Research</h2>
        <p>AI tools are particularly effective in case analysis, helping lawyers identify relevant case law, analyze legal precedents, and understand complex legal relationships. These tools can process thousands of documents simultaneously, finding connections that might not be immediately apparent.</p>
        
        <h2>The Future of Legal Practice</h2>
        <p>As AI technology continues to evolve, it's becoming an indispensable tool for modern legal practice. Legal professionals who embrace AI-powered research tools are better positioned to serve their clients effectively and stay competitive in the evolving legal landscape.</p>
      `,
      author: "Rajesh Kumar",
      date: "2024-12-12",
      readTime: "6 min read",
      category: "Technology",
      image: "/logo4.png",
      tags: ["AI", "Technology", "Legal Research"]
    },
    3: {
      id: 3,
      title: "Digital Transformation in Law Firms",
      content: `
        <p>Digital transformation is no longer optional for law firms. This article explores how leading firms are leveraging technology to streamline operations, enhance client experiences, and stay competitive in the modern legal landscape.</p>
        
        <h2>Learn How Law Firms Are Embracing Digital Transformation</h2>
        <p>Learn how law firms are embracing digital transformation to improve efficiency and client service. The legal industry is experiencing a significant shift towards digitalization, with firms adopting new technologies to modernize their operations and better serve their clients.</p>
        
        <p>Digital transformation in law firms involves more than just adopting new software—it requires a fundamental shift in how legal services are delivered, how cases are managed, and how client relationships are maintained.</p>
        
        <h2>Improving Efficiency and Client Service</h2>
        <p>Discover best practices and implementation strategies for digital transformation. Key areas where law firms are seeing significant improvements include:</p>
        <ul>
          <li><strong>Case Management:</strong> Automated workflows and document management systems</li>
          <li><strong>Client Communication:</strong> Digital portals and communication platforms</li>
          <li><strong>Legal Research:</strong> AI-powered research tools and databases</li>
          <li><strong>Billing and Accounting:</strong> Automated time tracking and invoicing systems</li>
        </ul>
        
        <h2>Best Practices for Implementation</h2>
        <p>Successful digital transformation requires careful planning and execution. Law firms should start by identifying their specific needs, evaluating available solutions, and implementing changes gradually to minimize disruption.</p>
        
        <p>Training and change management are also crucial components of successful digital transformation. Ensuring that all team members are comfortable with new technologies and understand their benefits is essential for adoption.</p>
        
        <h2>Staying Competitive</h2>
        <p>Firms that successfully embrace digital transformation are better positioned to compete in the modern legal market. They can offer faster, more efficient services, improve client satisfaction, and operate more cost-effectively.</p>
      `,
      author: "Anita Mehta",
      date: "2024-12-10",
      readTime: "10 min read",
      category: "Business",
      image: "/logo4.png",
      tags: ["Digital Transformation", "Business", "Technology"]
    },
    4: {
      id: 4,
      title: "Contract Management Strategies",
      content: `
        <p>Effective contract management is crucial for legal success. This guide covers the latest tools, strategies, and best practices for managing contracts efficiently in the digital age.</p>
        
        <h2>Master the Art of Digital Contract Management</h2>
        <p>Master the art of digital contract management with modern tools and proven strategies. In today's fast-paced business environment, effective contract management is essential for legal professionals who need to track, analyze, and manage multiple contracts efficiently.</p>
        
        <p>Digital contract management systems help legal professionals streamline their workflow, reduce errors, and ensure compliance with contractual obligations. These systems provide centralized access to contract information, automated reminders, and powerful search capabilities.</p>
        
        <h2>Learn How to Streamline Your Contract Workflow</h2>
        <p>Learn how to streamline your contract workflow with proven strategies and modern tools. Key components of effective contract management include:</p>
        <ul>
          <li><strong>Contract Creation:</strong> Templates and automated drafting tools</li>
          <li><strong>Review and Approval:</strong> Digital workflows and approval processes</li>
          <li><strong>Storage and Organization:</strong> Centralized repositories with search capabilities</li>
          <li><strong>Monitoring and Compliance:</strong> Automated tracking of key dates and obligations</li>
        </ul>
        
        <h2>Modern Tools and Technologies</h2>
        <p>Modern contract management tools leverage AI and automation to make contract management more efficient. These tools can extract key information from contracts, identify risks, and provide insights that help legal professionals make better decisions.</p>
        
        <p>Integration with other legal technology platforms is also important, allowing contract data to flow seamlessly between different systems and applications used in legal practice.</p>
        
        <h2>Best Practices</h2>
        <p>Successful contract management requires a combination of the right tools, clear processes, and ongoing attention to detail. Legal professionals should establish standardized procedures, train team members on best practices, and regularly review and update their contract management approach.</p>
      `,
      author: "Vikram Singh",
      date: "2024-12-08",
      readTime: "7 min read",
      category: "Contracts",
      image: "/logo4.png",
      tags: ["Contracts", "Management", "Strategy"]
    },
    5: {
      id: 5,
      title: "Legal Ethics in the Digital Era",
      content: `
        <p>As technology continues to evolve, legal professionals face new ethical challenges. This article examines the intersection of law, technology, and ethics, providing guidance for navigating this complex landscape.</p>
        
        <h2>Explore the Evolving Landscape of Legal Ethics</h2>
        <p>Explore the evolving landscape of legal ethics in our digital world. The rapid advancement of technology has introduced new ethical considerations for legal professionals, requiring them to navigate complex issues related to data privacy, AI use, and digital communication.</p>
        
        <p>Legal ethics in the digital era involves understanding how traditional ethical principles apply to new technologies and digital practices. This includes considerations around client confidentiality, data security, and the appropriate use of AI and automation tools.</p>
        
        <h2>Understand New Challenges and Responsibilities</h2>
        <p>Understand new challenges and responsibilities for modern lawyers. Key ethical considerations in the digital era include:</p>
        <ul>
          <li><strong>Data Privacy and Security:</strong> Protecting client information in digital systems</li>
          <li><strong>AI and Automation:</strong> Ethical use of AI tools in legal practice</li>
          <li><strong>Digital Communication:</strong> Maintaining confidentiality in digital communications</li>
          <li><strong>Competence:</strong> Staying current with technology and its ethical implications</li>
        </ul>
        
        <h2>Navigating Ethical Challenges</h2>
        <p>Legal professionals must be proactive in understanding and addressing ethical challenges related to technology. This includes staying informed about relevant regulations, implementing appropriate safeguards, and ensuring that technology use aligns with ethical obligations.</p>
        
        <p>Professional development and continuing education are essential for legal professionals to stay current with both technological advances and the ethical considerations they raise.</p>
        
        <h2>Best Practices</h2>
        <p>Adopting best practices for ethical technology use helps legal professionals maintain high standards while leveraging the benefits of modern tools. This includes clear policies, regular training, and ongoing evaluation of technology use in legal practice.</p>
      `,
      author: "Dr. Meera Patel",
      date: "2024-12-05",
      readTime: "9 min read",
      category: "Ethics",
      image: "/logo4.png",
      tags: ["Ethics", "Digital Era", "Legal Practice"]
    },
    6: {
      id: 6,
      title: "Building a Successful Practice",
      content: `
        <p>Building a successful legal practice requires more than just legal expertise. This comprehensive guide covers business development, client relationships, technology adoption, and other key factors for long-term success.</p>
        
        <h2>Learn Proven Strategies for Building and Growing</h2>
        <p>Learn proven strategies for building and growing a successful legal practice. Success in legal practice involves a combination of legal skills, business acumen, and effective client management. Legal professionals must balance the practice of law with the business aspects of running a practice.</p>
        
        <p>Building a successful practice requires strategic planning, clear goals, and a commitment to continuous improvement. This involves understanding your market, identifying your strengths, and developing a clear value proposition for clients.</p>
        
        <h2>Get Insights from Industry Experts</h2>
        <p>Get insights from industry experts and successful practitioners. Key factors for building a successful legal practice include:</p>
        <ul>
          <li><strong>Business Development:</strong> Building a strong client base and referral network</li>
          <li><strong>Client Relationships:</strong> Providing excellent service and maintaining strong relationships</li>
          <li><strong>Technology Adoption:</strong> Leveraging modern tools to improve efficiency and service quality</li>
          <li><strong>Professional Development:</strong> Continuous learning and skill development</li>
          <li><strong>Financial Management:</strong> Effective billing, collections, and financial planning</li>
        </ul>
        
        <h2>Client Relationships and Service Excellence</h2>
        <p>Strong client relationships are the foundation of a successful practice. This involves clear communication, responsiveness, and a commitment to delivering value. Legal professionals should focus on understanding client needs and providing solutions that address those needs effectively.</p>
        
        <h2>Long-Term Success</h2>
        <p>Building a successful practice is a long-term endeavor that requires patience, persistence, and a commitment to excellence. By focusing on client service, professional development, and strategic growth, legal professionals can build practices that thrive over time.</p>
      `,
      author: "Arjun Gupta",
      date: "2024-12-02",
      readTime: "12 min read",
      category: "Practice",
      image: "/logo4.png",
      tags: ["Practice", "Business", "Success"]
    }
  };

  const post = blogPosts[id];

  if (!post) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-10 sm:py-12 md:py-16 lg:py-20 text-center">
          <h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 break-words"
            style={{
              color: '#1E65AD',
              fontFamily: "'Bricolage Grotesque', sans-serif"
            }}
          >
            Post Not Found
          </h1>
          <p
            className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 break-words"
            style={{
              color: '#8C969F',
              fontFamily: "'Heebo', sans-serif"
            }}
          >
            The blog post you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base text-white transition-all duration-200"
            style={{
              backgroundColor: '#1E65AD',
              fontFamily: "'Heebo', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#CF9B63';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#1E65AD';
            }}
          >
            Back to Blog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = post.title;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pt-4 sm:pt-6 md:pt-8">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-1.5 sm:gap-2 font-semibold transition-all duration-200 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base"
          style={{
            color: '#1E65AD',
            fontFamily: "'Heebo', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#CF9B63';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#1E65AD';
          }}
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Back to Blog</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
        {/* Featured Image */}
        <div className="relative h-40 sm:h-48 md:h-64 lg:h-80 xl:h-96 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 md:mb-8 mx-2 sm:mx-0"
          style={{ backgroundColor: '#F9FAFC' }}
        >
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)';
            }}
          />
          <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4">
            <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm font-semibold text-white"
              style={{
                backgroundColor: '#CF9B63',
                fontFamily: "'Heebo', sans-serif"
              }}
            >
              {post.category}
            </span>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">
          <h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight break-words"
            style={{
              color: '#1E65AD',
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm"
            style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="font-medium break-words">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="break-words">{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(30, 101, 173, 0.1)',
                  color: '#1E65AD',
                  fontFamily: "'Heebo', sans-serif"
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 border-t"
            style={{ borderColor: 'rgba(30, 101, 173, 0.1)' }}
          >
            <span
              className="text-xs sm:text-sm font-medium"
              style={{
                color: '#8C969F',
                fontFamily: "'Heebo', sans-serif"
              }}
            >
              Share:
            </span>
            <button
              onClick={() => handleShare('facebook')}
              className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: 'rgba(30, 101, 173, 0.1)',
                color: '#1E65AD'
              }}
            >
              <Facebook className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: 'rgba(30, 101, 173, 0.1)',
                color: '#1E65AD'
              }}
            >
              <Twitter className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: 'rgba(30, 101, 173, 0.1)',
                color: '#1E65AD'
              }}
            >
              <Linkedin className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
            </button>
          </div>
        </header>

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 xl:p-12 shadow-lg mx-2 sm:mx-0"
          style={{
            border: '1px solid rgba(30, 101, 173, 0.1)',
            boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              color: '#4B5563',
              fontFamily: "'Heebo', sans-serif",
              lineHeight: '1.8',
              fontSize: '14px'
            }}
            className="blog-content"
          />
        </div>

        {/* Related Posts Section */}
        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 px-2 sm:px-0">
          <h2
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 md:mb-8"
            style={{
              color: '#1E65AD',
              fontFamily: "'Bricolage Grotesque', sans-serif"
            }}
          >
            Related Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {Object.values(blogPosts)
              .filter(p => p.id !== post.id && p.category === post.category)
              .slice(0, 2)
              .map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() => navigate(`/blog/${relatedPost.id}`)}
                  className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    border: '1px solid rgba(30, 101, 173, 0.1)',
                    boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
                  }}
                >
                  <h3
                    className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-2.5 md:mb-3 break-words"
                    style={{
                      color: '#1E65AD',
                      fontFamily: "'Bricolage Grotesque', sans-serif"
                    }}
                  >
                    {relatedPost.title}
                  </h3>
                  <p
                    className="text-xs sm:text-sm mb-3 sm:mb-3.5 md:mb-4 break-words"
                    style={{
                      color: '#8C969F',
                      fontFamily: "'Heebo', sans-serif"
                    }}
                  >
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs"
                    style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}
                  >
                    <span className="break-words">{formatDate(relatedPost.date)}</span>
                    <span>•</span>
                    <span>{relatedPost.readTime}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </article>

      {/* Custom Styles for Blog Content */}
      <style>{`
        .blog-content h2 {
          color: #1E65AD;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        @media (min-width: 640px) {
          .blog-content h2 {
            font-size: 1.5rem;
            margin-top: 1.75rem;
            margin-bottom: 0.875rem;
          }
        }
        @media (min-width: 768px) {
          .blog-content h2 {
            font-size: 1.875rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
        }
        .blog-content p {
          margin-bottom: 1rem;
          line-height: 1.8;
          font-size: 14px;
        }
        @media (min-width: 640px) {
          .blog-content p {
            margin-bottom: 1.25rem;
            font-size: 16px;
          }
        }
        @media (min-width: 768px) {
          .blog-content p {
            margin-bottom: 1.5rem;
            font-size: 18px;
          }
        }
        .blog-content ul {
          margin-bottom: 1rem;
          padding-left: 1.25rem;
        }
        @media (min-width: 640px) {
          .blog-content ul {
            margin-bottom: 1.25rem;
            padding-left: 1.5rem;
          }
        }
        @media (min-width: 768px) {
          .blog-content ul {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
          }
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.8;
        }
        @media (min-width: 640px) {
          .blog-content li {
            margin-bottom: 0.625rem;
          }
        }
        @media (min-width: 768px) {
          .blog-content li {
            margin-bottom: 0.75rem;
          }
        }
        .blog-content strong {
          color: #1E65AD;
          font-weight: 600;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default BlogPost;

