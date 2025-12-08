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
      title: "The Future of Legal Research: AI-Powered Solutions",
      content: `
        <p>The legal industry is experiencing a transformative shift, driven by artificial intelligence and advanced technology. At Salhakar, we're at the forefront of this revolution, making legal research more accessible, efficient, and intelligent than ever before.</p>
        
        <h2>Understanding AI in Legal Research</h2>
        <p>Artificial Intelligence has revolutionized how legal professionals conduct research. Gone are the days of manually sifting through thousands of documents. Today, AI-powered platforms can analyze vast amounts of legal data in seconds, providing accurate, relevant results that would have taken hours or even days to find manually.</p>
        
        <p>Our AI technology at Salhakar uses advanced natural language processing to understand complex legal queries. Whether you're searching for specific case law, legal precedents, or statutory provisions, our system can interpret your question and provide precise answers.</p>
        
        <h2>Key Benefits of AI-Powered Legal Research</h2>
        <ul>
          <li><strong>Speed:</strong> Research that once took hours can now be completed in minutes</li>
          <li><strong>Accuracy:</strong> AI reduces human error and ensures comprehensive coverage</li>
          <li><strong>Accessibility:</strong> Legal information is now accessible to everyone, regardless of language or technical expertise</li>
          <li><strong>Cost-Effective:</strong> Reduce research costs while improving outcomes</li>
        </ul>
        
        <h2>The Salhakar Advantage</h2>
        <p>What sets Salhakar apart is our commitment to making legal research truly accessible. Our platform supports multiple Indian languages, ensuring that legal professionals across the country can access the information they need in their preferred language.</p>
        
        <p>Our AI doesn't just find information—it understands context, relationships between legal concepts, and can even help you discover connections you might not have considered. This intelligent approach to legal research is transforming how lawyers, students, and researchers work.</p>
        
        <h2>Looking Ahead</h2>
        <p>As AI technology continues to evolve, we're committed to staying at the cutting edge. We're constantly improving our algorithms, expanding our database, and adding new features that make legal research even more powerful and intuitive.</p>
        
        <p>The future of legal research is here, and it's more accessible than ever. Join thousands of legal professionals who are already using Salhakar to transform their research workflow.</p>
      `,
      author: "Salhakar Team",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "AI & Technology",
      image: "/logo4.png",
      tags: ["AI", "Legal Tech", "Innovation"]
    },
    2: {
      id: 2,
      title: "Understanding BNS to IPC Mapping: A Comprehensive Guide",
      content: `
        <p>The transition from the Indian Penal Code (IPC) to the Bharatiya Nyaya Sanhita (BNS) represents one of the most significant legal reforms in India's history. Understanding how these legal frameworks map to each other is crucial for legal professionals navigating this transition.</p>
        
        <h2>What is BNS to IPC Mapping?</h2>
        <p>BNS to IPC mapping refers to the process of correlating sections and provisions between the old IPC and the new BNS. This mapping helps legal professionals understand how existing legal concepts, case law, and precedents translate to the new legal framework.</p>
        
        <h2>Key Differences and Similarities</h2>
        <p>While the BNS introduces several new provisions and reorganizes existing ones, many core legal concepts remain consistent. Understanding these mappings is essential for:</p>
        <ul>
          <li>Legal practitioners preparing cases</li>
          <li>Law students studying criminal law</li>
          <li>Researchers analyzing legal precedents</li>
          <li>Judges interpreting new legislation</li>
        </ul>
        
        <h2>How Salhakar Simplifies This Process</h2>
        <p>At Salhakar, we've developed comprehensive mapping tools that make it easy to navigate between IPC and BNS. Our platform provides:</p>
        <ul>
          <li>Section-by-section mapping</li>
          <li>Cross-references to relevant case law</li>
          <li>Explanatory notes on changes</li>
          <li>Search functionality across both frameworks</li>
        </ul>
        
        <h2>Practical Applications</h2>
        <p>Understanding BNS to IPC mapping is not just academic—it has real-world implications for ongoing cases, legal research, and the practice of law in India. Our tools help ensure continuity and clarity during this transition period.</p>
      `,
      author: "Legal Experts",
      date: "2024-01-10",
      readTime: "8 min read",
      category: "Legal Updates",
      image: "/logo4.png",
      tags: ["BNS", "IPC", "Legal Framework"]
    },
    3: {
      id: 3,
      title: "How to Conduct Efficient Legal Research",
      content: `
        <p>Efficient legal research is the cornerstone of successful legal practice. Whether you're preparing for a case, writing a brief, or studying for exams, mastering research techniques can save you countless hours and improve the quality of your work.</p>
        
        <h2>Start with a Clear Research Plan</h2>
        <p>Before diving into research, take time to clearly define your objectives. What specific information are you seeking? What questions need to be answered? A well-defined research plan will guide your efforts and prevent wasted time.</p>
        
        <h2>Use Multiple Research Sources</h2>
        <p>Effective legal research involves consulting multiple sources:</p>
        <ul>
          <li>Primary sources (statutes, regulations, case law)</li>
          <li>Secondary sources (legal commentaries, journals)</li>
          <li>Legal databases and research platforms</li>
          <li>Expert opinions and analysis</li>
        </ul>
        
        <h2>Leverage Technology</h2>
        <p>Modern legal research platforms like Salhakar can dramatically improve your efficiency. Our AI-powered search can understand natural language queries, find relevant cases across multiple jurisdictions, and even suggest related legal concepts you might not have considered.</p>
        
        <h2>Organize Your Findings</h2>
        <p>As you research, maintain organized notes. Use bookmarks, tags, and folders to categorize information. This organization will save time when you need to reference your research later.</p>
        
        <h2>Verify and Cross-Reference</h2>
        <p>Always verify information from multiple sources. Cross-reference cases, check for updates to legislation, and ensure you're working with the most current legal information available.</p>
      `,
      author: "Research Team",
      date: "2024-01-05",
      readTime: "6 min read",
      category: "Legal Tips",
      image: "/logo4.png",
      tags: ["Research", "Productivity", "Tips"]
    },
    4: {
      id: 4,
      title: "Case Study: Successful Legal Research Using Salhakar",
      content: `
        <p>This case study examines how a leading law firm in Mumbai transformed their legal research process using Salhakar's AI-powered platform, achieving a 300% improvement in research efficiency.</p>
        
        <h2>The Challenge</h2>
        <p>The firm was spending an average of 15-20 hours per week on legal research for each active case. With a growing caseload and increasing client expectations, they needed a solution that could reduce research time without compromising quality.</p>
        
        <h2>The Solution</h2>
        <p>After implementing Salhakar, the firm's research team discovered several key advantages:</p>
        <ul>
          <li>Faster case law discovery</li>
          <li>Multilingual research capabilities</li>
          <li>Intelligent cross-referencing</li>
          <li>Comprehensive legal database access</li>
        </ul>
        
        <h2>Results</h2>
        <p>Within three months of implementation, the firm reported:</p>
        <ul>
          <li>75% reduction in research time</li>
          <li>Improved accuracy in case citations</li>
          <li>Better client satisfaction</li>
          <li>Increased capacity to handle more cases</li>
        </ul>
        
        <h2>Key Takeaways</h2>
        <p>This case study demonstrates that modern AI-powered legal research tools can significantly enhance law firm operations while maintaining the highest standards of legal research quality.</p>
      `,
      author: "Case Studies",
      date: "2023-12-28",
      readTime: "7 min read",
      category: "Case Studies",
      image: "/logo4.png",
      tags: ["Case Study", "Success Story", "Efficiency"]
    },
    5: {
      id: 5,
      title: "Latest Updates in Indian Legal System",
      content: `
        <p>Stay informed about the latest changes, amendments, and updates in the Indian legal system. This comprehensive overview covers recent developments that every legal professional should know.</p>
        
        <h2>Recent Legislative Changes</h2>
        <p>The Indian legal system has seen significant updates in recent months, including new legislation, amendments to existing laws, and important judicial decisions that impact legal practice across the country.</p>
        
        <h2>Key Updates</h2>
        <ul>
          <li>New criminal law reforms (BNS, BNSS, BSA)</li>
          <li>Updates to commercial and corporate law</li>
          <li>Changes in procedural requirements</li>
          <li>Important Supreme Court and High Court decisions</li>
        </ul>
        
        <h2>Impact on Legal Practice</h2>
        <p>These updates have far-reaching implications for legal professionals. Understanding these changes is essential for effective legal practice and ensuring compliance with current legal requirements.</p>
        
        <h2>Staying Updated</h2>
        <p>Platforms like Salhakar help legal professionals stay current with the latest legal developments, providing timely updates and comprehensive coverage of changes in the legal landscape.</p>
      `,
      author: "Legal Updates",
      date: "2023-12-20",
      readTime: "4 min read",
      category: "Industry News",
      image: "/logo4.png",
      tags: ["Legal Updates", "India", "News"]
    },
    6: {
      id: 6,
      title: "Multilingual Legal Research: Breaking Language Barriers",
      content: `
        <p>Language should never be a barrier to accessing legal information. At Salhakar, we're committed to making legal research accessible in multiple Indian languages, ensuring that legal professionals across the country can work in their preferred language.</p>
        
        <h2>The Language Challenge</h2>
        <p>India's linguistic diversity presents unique challenges for legal research. Legal professionals often need to work in regional languages, but most legal databases and research tools are primarily available in English.</p>
        
        <h2>Our Solution</h2>
        <p>Salhakar's multilingual platform supports research in multiple Indian languages, including:</p>
        <ul>
          <li>Hindi</li>
          <li>Gujarati</li>
          <li>Tamil</li>
          <li>Telugu</li>
          <li>Bengali</li>
          <li>And many more</li>
        </ul>
        
        <h2>Benefits of Multilingual Research</h2>
        <p>Multilingual legal research capabilities provide several advantages:</p>
        <ul>
          <li>Accessibility for non-English speakers</li>
          <li>Better understanding of regional legal contexts</li>
          <li>Improved communication with clients</li>
          <li>Enhanced legal education opportunities</li>
        </ul>
        
        <h2>Technology Behind It</h2>
        <p>Our advanced AI technology uses natural language processing to understand and process legal queries in multiple languages, ensuring accurate and relevant results regardless of the language used.</p>
      `,
      author: "Technology Team",
      date: "2023-12-15",
      readTime: "5 min read",
      category: "AI & Technology",
      image: "/logo4.png",
      tags: ["Multilingual", "Accessibility", "Technology"]
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

