package com.kunkunyu.migarte.comment;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import run.halo.app.core.extension.content.Comment;
import run.halo.app.core.extension.content.Post;
import run.halo.app.core.extension.content.SinglePage;
import run.halo.app.extension.DefaultExtensionMatcher;
import run.halo.app.extension.ExtensionClient;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Ref;
import run.halo.app.extension.controller.Controller;
import run.halo.app.extension.controller.ControllerBuilder;
import run.halo.app.extension.controller.Reconciler;
import run.halo.app.extension.router.selector.FieldSelector;

import static run.halo.app.extension.ExtensionUtil.*;
import static run.halo.app.extension.index.query.QueryFactory.equal;

@Component
@RequiredArgsConstructor
public class MigarteCommentReconciler implements Reconciler<Reconciler.Request> {
    private final ExtensionClient client;

    @Override
    public Result reconcile(Request request) {
        client.fetch(Comment.class, request.name())
            .ifPresent(comment -> {
                if (isDeleted(comment)) {
                    return;
                }

                var subjectRef = comment.getSpec().getSubjectRef();

                handleRatingComment(subjectRef);

                client.update(comment);
            });
        return new Result(false, null);
    }


    private void handleRatingComment(Ref subjectRef) {

        if (subjectRef.getKind().equals("Post")) {
            client.listAll(Post.class, new ListOptions(),defaultSort())
                .stream().filter(post -> subjectRef.getName().equals(post.getStatus().getPermalink()))
                .forEach(post -> {
                    subjectRef.setName(post.getMetadata().getName());
                });
        }

        if (subjectRef.getKind().equals("SinglePage")) {
            client.listAll(SinglePage.class,new ListOptions(),defaultSort())
                .stream().filter(singlePage -> subjectRef.getName().equals(singlePage.getStatus().getPermalink()))
                .forEach(singlePage -> {
                    subjectRef.setName(singlePage.getMetadata().getName());
                });
        }

        if (subjectRef.getKind().equals("Moment")) {
            String originalString = subjectRef.getName();
            int lastSlashIndex = originalString.lastIndexOf('/');
            String extractedString = originalString.substring(lastSlashIndex + 1);
            subjectRef.setName(extractedString);

        }
    }


    @Override
    public Controller setupWith(ControllerBuilder builder) {
        var extension = new Comment();
        return builder
            .extension(extension)
            .onAddMatcher(DefaultExtensionMatcher.builder(client, extension.groupVersionKind())
                .fieldSelector(FieldSelector.of(
                    equal(Comment.REQUIRE_SYNC_ON_STARTUP_INDEX_NAME, BooleanUtils.TRUE))
                )
                .build()
            )
            .build();
    }

    static Sort defaultSort() {
        return Sort.by("metadata.creationTimestamp");
    }

}
