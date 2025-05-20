import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Beaker, ExternalLink, Heart, Info, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PageTransition from '@/components/PageTransition';
import { reinitializeAllContent } from '@/integrations/supabase/initializeContentBlocks';
import { toast } from '@/components/ui/use-toast';
import Footer from '@/components/Footer';
import HeroShape from '@/components/HeroShape';

interface ContentBlock {
  id: string;
  name: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
}

const LandingPage = () => {
  const [contentBlocks, setContentBlocks] = useState<Record<string, ContentBlock>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      
      try {
        const { data: blocks, error } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('page', '/');
          
        if (error) {
          throw error;
        }
        
        if (!blocks || blocks.length === 0) {
          console.log('No content blocks found, initializing...');
          await reinitializeAllContent();
          
          const { data: initializedBlocks, error: fetchError } = await supabase
            .from('content_blocks')
            .select('*')
            .eq('page', '/');
            
          if (fetchError) throw fetchError;
          
          const blocksRecord = (initializedBlocks || []).reduce((acc, block) => {
            acc[block.name] = block;
            return acc;
          }, {} as Record<string, ContentBlock>);
          
          setContentBlocks(blocksRecord);
        } else {
          const blocksRecord = blocks.reduce((acc, block) => {
            acc[block.name] = block;
            return acc;
          }, {} as Record<string, ContentBlock>);
          
          setContentBlocks(blocksRecord);
        }
      } catch (error) {
        console.error('Error fetching content blocks:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching content blocks',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const getContent = (name: string, field: 'title' | 'content' = 'content') => {
    const block = contentBlocks[name];
    if (!block) return '';
    return field === 'title' ? block.title || '' : block.content || '';
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/placeholder.svg" alt="Eyefem Logo" className="h-8 w-8" />
              <span className="font-bold text-xl">Eyefem</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-800 hover:text-primary transition-colors">Home</Link>
              <Link to="/specialties" className="text-gray-800 hover:text-primary transition-colors">Our Specialties</Link>
              <Link to="/eyecare" className="text-gray-800 hover:text-primary transition-colors">Eye Care</Link>
              <Link to="/gynecology" className="text-gray-800 hover:text-primary transition-colors">Gynecology</Link>
              <Link to="/specialties">
                <Button className="rounded-full px-5 py-2 bg-primary hover:bg-primary/90">
                  {getContent('hero_button')}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white pt-16">
          <HeroShape className="top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
          <HeroShape className="top-3/4 left-1/5 -translate-y-1/2" />
          <HeroShape className="top-2/3 right-1/4 translate-x-1/2" />
          <HeroShape className="bottom-1/4 right-1/5" />

          <div className="relative z-10 text-center max-w-3xl mx-auto px-4" data-aos="fade-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {getContent('hero_title', 'title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {getContent('hero_description')}
            </p>
            <Link to="/specialties">
              <Button className="rounded-full px-8 py-6 text-lg bg-white text-primary hover:bg-white/90">
                {getContent('hero_button')}
              </Button>
            </Link>
          </div>
        </div>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" data-aos="fade-up">
              {getContent('specialties_heading', 'title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                className="bg-blue-50 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300"
                data-aos="fade-up" 
                data-aos-delay="100"
              >
                <h3 className="text-2xl font-bold text-blue-600 mb-4">{getContent('eyecare_title', 'title')}</h3>
                <p className="text-gray-700 mb-6">
                  {getContent('eyecare_description')}
                </p>
                <Link to="/eyecare">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    {getContent('eyecare_button')}
                  </Button>
                </Link>
              </div>
              
              <div 
                className="bg-purple-50 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300"
                data-aos="fade-up" 
                data-aos-delay="200"
              >
                <h3 className="text-2xl font-bold text-purple-600 mb-4">{getContent('gynecology_title', 'title')}</h3>
                <p className="text-gray-700 mb-6">
                  {getContent('gynecology_description')}
                </p>
                <Link to="/gynecology">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    {getContent('gynecology_button')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-aos="fade-up">
              {getContent('why_choose_title', 'title')}
            </h2>
            <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              {getContent('why_choose_description')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                data-aos="fade-up" 
                data-aos-delay="100"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-blue-600 h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">{getContent('feature_specialists_title', 'title')}</h3>
                <p className="text-gray-600">
                  {getContent('feature_specialists_content')}
                </p>
              </div>
              
              <div 
                className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                data-aos="fade-up" 
                data-aos-delay="200"
              >
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Beaker className="text-purple-600 h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">{getContent('feature_technology_title', 'title')}</h3>
                <p className="text-gray-600">
                  {getContent('feature_technology_content')}
                </p>
              </div>
              
              <div 
                className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                data-aos="fade-up" 
                data-aos-delay="300"
              >
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-pink-600 h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">{getContent('feature_care_title', 'title')}</h3>
                <p className="text-gray-600">
                  {getContent('feature_care_content')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          <div className="container mx-auto max-w-5xl text-center" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {getContent('cta_title', 'title')}
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
              {getContent('cta_description')}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/eyecare/appointment">
                <Button className="rounded-full px-8 py-4 text-lg bg-white text-blue-600 hover:bg-white/90 transform hover:scale-105 transition-transform duration-300">
                  Book Eye Care Appointment
                </Button>
              </Link>
              <Link to="/gynecology/appointment">
                <Button className="rounded-full px-8 py-4 text-lg bg-white text-pink-600 hover:bg-white/90 transform hover:scale-105 transition-transform duration-300">
                  Book Gynecology Appointment
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default LandingPage;
