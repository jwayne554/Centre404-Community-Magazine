import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LikeButton from '@/components/ui/LikeButton';
import { Volume2, Plus, Calendar } from 'lucide-react';
import { getCategoryEmoji, getCategoryLabel } from '@/utils/category-helpers';

interface MagazineItem {
  id: string;
  submission: {
    id: string;
    category: string;
    contentType: string;
    textContent: string | null;
    mediaUrl: string | null;
    drawingData: string | null;
    user: {
      id: string;
      name: string;
    } | null;
  };
}

interface MagazineData {
  id: string;
  title: string;
  description: string | null;
  publishedAt: Date | null;
  items: MagazineItem[];
}

interface MagazineContentProps {
  magazine: MagazineData;
  likeCounts: Record<string, number>;
}

// Format date helper
const formatDate = (date: Date | null) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export default function MagazineContent({ magazine, likeCounts }: MagazineContentProps) {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{magazine.title}</h1>
        {magazine.publishedAt && (
          <p className="text-dark-gray flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(magazine.publishedAt)}
          </p>
        )}
        {magazine.description && (
          <p className="text-dark-gray mt-2">{magazine.description}</p>
        )}
      </div>

      {/* Articles */}
      {magazine.items.length > 0 ? (
        <div className="space-y-6">
          {magazine.items.map((item) => {
            const submission = item.submission;
            const author = submission.user?.name || 'Anonymous';
            const categoryEmoji = getCategoryEmoji(submission.category);

            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="p-6">
                  {/* Category and Author */}
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">{categoryEmoji}</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium mr-3">
                      {getCategoryLabel(submission.category)}
                    </span>
                    <span className="text-dark-gray text-sm">
                      By {author}
                    </span>
                  </div>

                  {/* Content */}
                  {submission.textContent && (
                    <p className="mb-4 whitespace-pre-wrap">{submission.textContent}</p>
                  )}

                  {/* Image */}
                  {submission.mediaUrl && (
                    <div className="mb-4 -mx-6">
                      <Image
                        src={submission.mediaUrl}
                        alt="Submission image"
                        width={800}
                        height={400}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Drawing */}
                  {submission.drawingData && (
                    <div className="mb-4">
                      <Image
                        src={submission.drawingData}
                        alt="Drawing"
                        width={400}
                        height={300}
                        className="max-w-full h-auto rounded-lg border border-light-gray"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-2">
                    <LikeButton
                      magazineId={magazine.id}
                      magazineItemId={item.id}
                      initialLikeCount={likeCounts[item.id] || 0}
                    />
                    {submission.contentType === 'AUDIO' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Volume2 className="h-4 w-4" />}
                        className="text-sm"
                      >
                        Listen
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-background rounded-xl border-2 border-dashed border-light-gray">
          <p className="text-dark-gray">No articles in this edition yet.</p>
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <div className="mb-6">
          <h3 className="text-xl font-medium">Thank you for reading!</h3>
          <p className="text-dark-gray mt-2">
            We love hearing from our community members.
          </p>
        </div>
        <Link href="/">
          <Button
            variant="primary"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
          >
            Share Your Story
          </Button>
        </Link>
      </div>
    </div>
  );
}
