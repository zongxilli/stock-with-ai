import React from 'react';

interface TextFormatterProps {
	text: string;
	preserveWhitespace?: boolean;
	className?: string;
}

/**
 * TextFormatter component that properly formats text with paragraphs and line breaks
 * It preserves meaningful whitespace while displaying text in a readable format
 */
const TextFormatter: React.FC<TextFormatterProps> = ({
	text,
	preserveWhitespace = false,
	className = '',
}) => {
	// Make sure input is a string
	if (typeof text !== 'string') {
		return <div className='text-red-500'>Invalid text input</div>;
	}

	// If the text is empty, return null
	if (!text.trim()) {
		return null;
	}

	// Process the text based on whitespace preservation preference
	if (preserveWhitespace) {
		// Replace single newlines with <br> but preserve paragraph breaks
		const processedText = text
			// Normalize line endings
			.replace(/\r\n|\r/g, '\n')
			// Replace two or more newlines with a special marker
			.replace(/\n{2,}/g, '[PARAGRAPH_BREAK]')
			// Replace single newlines with <br>
			.replace(/\n/g, '[LINE_BREAK]')
			// Split by paragraph breaks
			.split('[PARAGRAPH_BREAK]');

		return (
			<div className={`text-formatter ${className}`}>
				{processedText.map((paragraph, index) => (
					<p key={index} className='mb-4 last:mb-0'>
						{paragraph
							.split('[LINE_BREAK]')
							.map((line, lineIndex) => (
								<React.Fragment key={lineIndex}>
									{lineIndex > 0 && <br />}
									{line}
								</React.Fragment>
							))}
					</p>
				))}
			</div>
		);
	} else {
		// Simple paragraph splitting
		const paragraphs = text
			// Normalize line endings
			.replace(/\r\n|\r/g, '\n')
			// Split by one or more newlines
			.split(/\n+/)
			// Filter out empty paragraphs
			.filter((p) => p.trim().length > 0);

		return (
			<div className={`text-formatter ${className}`}>
				{paragraphs.map((paragraph, index) => (
					<p key={index} className='mb-4 last:mb-0'>
						{paragraph}
					</p>
				))}
			</div>
		);
	}
};

export default TextFormatter;
